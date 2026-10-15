-- W02 foundation. No learner records, credentials, marks or published lessons.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 160),
  timezone text not null default 'Africa/Johannesburg' check (timezone = 'Africa/Johannesburg'),
  status text not null default 'active' check (status in ('active','suspended','archived')),
  created_at timestamptz not null default now()
);
create table public.school_memberships (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id),
  user_id uuid not null references auth.users(id),
  role text not null check (role in ('school_admin','teacher','learner','parent')),
  status text not null default 'active' check (status in ('active','revoked')),
  valid_from timestamptz not null default now(), valid_to timestamptz,
  check (valid_to is null or valid_to > valid_from),
  unique (school_id, user_id, role), unique (school_id,id)
);
create index memberships_user_school_idx on public.school_memberships(user_id,school_id);
create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id),
  year integer not null check (year between 2020 and 2100),
  starts_on date not null, ends_on date not null,
  check (ends_on >= starts_on),
  unique (school_id,year), unique (school_id,id)
);
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id),
  academic_year_id uuid not null,
  grade_code text not null check (grade_code in ('R','1','2','3','4','5','6','7','8','9','10','11','12')),
  name text not null check (length(btrim(name)) between 1 and 80),
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(),
  foreign key (school_id,academic_year_id) references public.academic_years(school_id,id),
  unique (school_id,academic_year_id,name), unique (school_id,id), unique (school_id,id,grade_code)
);
create table public.curriculum_frameworks (
  id uuid primary key default gen_random_uuid(), code text unique not null,
  name text not null, jurisdiction text not null
);
create table public.curriculum_versions (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.curriculum_frameworks(id),
  edition text not null, state text not null default 'draft' check (state in ('draft','published','retired')),
  applicable_year integer not null, reviewer_id uuid references auth.users(id), reviewed_at timestamptz,
  check (state <> 'published' or (reviewer_id is not null and reviewed_at is not null)),
  unique (framework_id,edition), unique (id,framework_id)
);
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.curriculum_frameworks(id),
  code text not null, phase text not null, name text not null,
  unique (framework_id,code,phase), unique (id,framework_id)
);
create table public.curriculum_offerings (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.curriculum_frameworks(id),
  curriculum_version_id uuid not null,
  subject_id uuid not null,
  grade_code text not null check (grade_code in ('R','1','2','3','4','5','6','7','8','9','10','11','12')),
  foreign key (curriculum_version_id,framework_id) references public.curriculum_versions(id,framework_id),
  foreign key (subject_id,framework_id) references public.subjects(id,framework_id),
  unique (curriculum_version_id,subject_id,grade_code), unique (id,grade_code)
);
create table public.curriculum_sources (
  id text primary key, issuer text not null, title text not null,
  url text not null check (url ~ '^https://'), edition text,
  retrieved_at date not null, sha256 text check (sha256 ~ '^[0-9a-f]{64}$'),
  location jsonb not null, verification text not null, applicability text not null, rights text not null
);
create table public.class_subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id), class_id uuid not null,
  grade_code text not null, curriculum_offering_id uuid not null,
  foreign key (school_id,class_id,grade_code) references public.classes(school_id,id,grade_code),
  foreign key (curriculum_offering_id,grade_code) references public.curriculum_offerings(id,grade_code),
  unique (school_id,class_id,curriculum_offering_id), unique (school_id,id)
);
create table public.teaching_allocations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id), class_subject_id uuid not null,
  teacher_id uuid not null references auth.users(id),
  membership_role text not null default 'teacher' check (membership_role = 'teacher'),
  status text not null default 'active' check (status in ('active','revoked')),
  valid_from timestamptz not null default now(), valid_to timestamptz,
  check (valid_to is null or valid_to > valid_from),
  foreign key (school_id,class_subject_id) references public.class_subjects(school_id,id),
  foreign key (school_id,teacher_id,membership_role) references public.school_memberships(school_id,user_id,role),
  unique (school_id,class_subject_id,teacher_id), unique (school_id,id)
);
create index allocations_teacher_idx on public.teaching_allocations(teacher_id,school_id,class_subject_id);
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id), class_subject_id uuid not null,
  learner_id uuid not null references auth.users(id),
  membership_role text not null default 'learner' check (membership_role = 'learner'),
  status text not null default 'active' check (status in ('active','revoked')),
  enrolled_at timestamptz not null default now(), ended_at timestamptz,
  check (ended_at is null or ended_at > enrolled_at),
  foreign key (school_id,class_subject_id) references public.class_subjects(school_id,id),
  foreign key (school_id,learner_id,membership_role) references public.school_memberships(school_id,user_id,role),
  unique (school_id,class_subject_id,learner_id), unique (school_id,id)
);
create index enrollments_learner_idx on public.enrollments(learner_id,school_id,class_subject_id);
create table public.guardian_links (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id),
  learner_id uuid not null references auth.users(id), guardian_id uuid not null references auth.users(id),
  learner_role text not null default 'learner' check (learner_role='learner'),
  guardian_role text not null default 'parent' check (guardian_role='parent'),
  foreign key (school_id,learner_id,learner_role) references public.school_memberships(school_id,user_id,role),
  foreign key (school_id,guardian_id,guardian_role) references public.school_memberships(school_id,user_id,role),
  verified_by uuid references auth.users(id), verified_at timestamptz,
  status text not null default 'pending' check (status in ('pending','verified','revoked')),
  check (status <> 'verified' or (verified_by is not null and verified_at is not null)),
  unique (school_id,learner_id,guardian_id), unique (school_id,id)
);
create index guardian_links_guardian_idx on public.guardian_links(guardian_id,school_id);
create table private.audit_logs (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id),
  actor_id uuid not null references auth.users(id), action text not null,
  resource_id uuid not null, recorded_at timestamptz not null default now()
);
create index audit_logs_school_idx on private.audit_logs(school_id,recorded_at);
create table private.command_receipts (
  school_id uuid not null references public.schools(id), actor_id uuid not null references auth.users(id),
  operation text not null, idempotency_key uuid not null, request jsonb not null,
  resource_id uuid not null, primary key (school_id,actor_id,operation,idempotency_key)
);

-- Definer helpers are private to avoid recursive membership RLS. They never trust profile/JWT metadata.
create function private.has_school_role(p_school uuid, p_roles text[])
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.school_memberships m join public.schools s on s.id=m.school_id
    where m.school_id=p_school and m.user_id=auth.uid() and m.role=any(p_roles)
      and m.status='active' and s.status='active' and m.valid_from<=now()
      and (m.valid_to is null or m.valid_to>now())
  );
$$;
create function private.can_teach_offering(p_school uuid, p_offering uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (
    private.has_school_role(p_school,array['school_admin']) or (
      private.has_school_role(p_school,array['teacher']) and exists (
        select 1 from public.teaching_allocations t join public.class_subjects cs on cs.school_id=t.school_id and cs.id=t.class_subject_id
        join public.classes c on c.school_id=cs.school_id and c.id=cs.class_id
        where t.school_id=p_school and t.class_subject_id=p_offering and t.teacher_id=auth.uid()
          and t.status='active' and t.valid_from<=now() and (t.valid_to is null or t.valid_to>now()) and c.status='active'
      )
    )
  );
$$;
create function private.can_read_offering(p_school uuid, p_offering uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (private.can_teach_offering(p_school,p_offering) or (
    private.has_school_role(p_school,array['learner']) and exists (
      select 1 from public.enrollments e join public.class_subjects cs on cs.school_id=e.school_id and cs.id=e.class_subject_id
      join public.classes c on c.school_id=cs.school_id and c.id=cs.class_id
      where e.school_id=p_school and e.class_subject_id=p_offering and e.learner_id=auth.uid()
        and e.status='active' and e.enrolled_at<=now() and (e.ended_at is null or e.ended_at>now()) and c.status='active'
    )
  ));
$$;
create function private.can_read_class(p_school uuid, p_class uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (private.has_school_role(p_school,array['school_admin']) or exists (
    select 1 from public.class_subjects cs where cs.school_id=p_school and cs.class_id=p_class and private.can_read_offering(p_school,cs.id)
  ));
$$;

-- Revoke default function execution before granting minimum roles.
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.has_school_role(uuid,text[]), private.can_teach_offering(uuid,uuid), private.can_read_offering(uuid,uuid), private.can_read_class(uuid,uuid) to authenticated;

-- All Data API tables have RLS before any access grants. Authority records have no direct write policies.
alter table public.schools enable row level security;
alter table public.school_memberships enable row level security;
alter table public.academic_years enable row level security;
alter table public.classes enable row level security;
alter table public.curriculum_frameworks enable row level security;
alter table public.curriculum_versions enable row level security;
alter table public.subjects enable row level security;
alter table public.curriculum_offerings enable row level security;
alter table public.curriculum_sources enable row level security;
alter table public.class_subjects enable row level security;
alter table public.teaching_allocations enable row level security;
alter table public.enrollments enable row level security;
alter table public.guardian_links enable row level security;
alter table private.audit_logs enable row level security;
alter table private.command_receipts enable row level security;
revoke all on public.schools,public.school_memberships,public.academic_years,public.classes,public.curriculum_frameworks,public.curriculum_versions,public.subjects,public.curriculum_offerings,public.curriculum_sources,public.class_subjects,public.teaching_allocations,public.enrollments,public.guardian_links from anon,authenticated;
grant select on public.schools,public.school_memberships,public.academic_years,public.classes,public.class_subjects,public.teaching_allocations,public.enrollments to authenticated;
grant select on public.curriculum_frameworks,public.curriculum_versions,public.subjects,public.curriculum_offerings,public.curriculum_sources to anon,authenticated;
revoke all on all tables in schema private from public,anon,authenticated;
create policy schools_read on public.schools for select to authenticated using (private.has_school_role(id,array['school_admin','teacher','learner','parent']));
create policy memberships_read on public.school_memberships for select to authenticated using (
  (user_id=(select auth.uid()) and private.has_school_role(school_id,array[role])) or private.has_school_role(school_id,array['school_admin'])
);
create policy years_read on public.academic_years for select to authenticated using (private.has_school_role(school_id,array['school_admin','teacher','learner']));
create policy classes_read on public.classes for select to authenticated using (private.can_read_class(school_id,id));
create policy offerings_read on public.class_subjects for select to authenticated using (private.can_read_offering(school_id,id));
create policy allocations_read on public.teaching_allocations for select to authenticated using (
  private.has_school_role(school_id,array['school_admin']) or (teacher_id=(select auth.uid()) and private.can_teach_offering(school_id,class_subject_id))
);
create policy enrollments_read on public.enrollments for select to authenticated using (
  (learner_id=(select auth.uid()) and private.can_read_offering(school_id,class_subject_id)) or private.can_teach_offering(school_id,class_subject_id)
);
-- Guardian data remains denied until the separately gated parent workflow is implemented.
create policy sources_read on public.curriculum_sources for select to anon,authenticated using (true);
create policy frameworks_read on public.curriculum_frameworks for select to anon,authenticated using (true);
create policy subjects_read on public.subjects for select to anon,authenticated using (true);
create policy versions_read on public.curriculum_versions for select to anon,authenticated using (state='published');
create policy curriculum_offerings_read on public.curriculum_offerings for select to anon,authenticated using (
  exists (select 1 from public.curriculum_versions v where v.id=curriculum_version_id and v.state='published')
);

-- Atomic, idempotent class command. Lock authority to serialize against operator revocation.
create function private.create_school_class(p_school uuid,p_year integer,p_grade text,p_name text,p_key uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_membership uuid; v_year uuid; v_class uuid; v_request jsonb; v_receipt private.command_receipts;
begin
  if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select m.id into v_membership from public.school_memberships m join public.schools s on s.id=m.school_id
    where m.school_id=p_school and m.user_id=v_user and m.role='school_admin' and m.status='active'
      and m.valid_from<=now() and (m.valid_to is null or m.valid_to>now()) and s.status='active'
    for update of m,s;
  if v_membership is null then raise exception 'School administrator access required' using errcode='42501'; end if;
  if p_year is null or p_year not between 2020 and 2100 or p_grade is null or p_grade not in ('R','1','2','3','4','5','6','7','8','9','10','11','12')
     or p_name is null or length(btrim(p_name)) not between 1 and 80 or p_key is null then
    raise exception 'Invalid class details' using errcode='22023';
  end if;
  v_request := jsonb_build_object('year',p_year,'grade',p_grade,'name',btrim(p_name));
  select * into v_receipt from private.command_receipts where school_id=p_school and actor_id=v_user and operation='class.create' and idempotency_key=p_key;
  if found then
    if v_receipt.request<>v_request then raise exception 'Idempotency key reused with different details' using errcode='23505'; end if;
    return v_receipt.resource_id;
  end if;
  -- Calendar-year container only; term dates and teaching days are configured in a later work package.
  insert into public.academic_years(school_id,year,starts_on,ends_on) values(p_school,p_year,make_date(p_year,1,1),make_date(p_year,12,31))
    on conflict (school_id,year) do nothing;
  select id into v_year from public.academic_years where school_id=p_school and year=p_year;
  insert into public.classes(school_id,academic_year_id,grade_code,name) values(p_school,v_year,p_grade,btrim(p_name)) returning id into v_class;
  insert into private.audit_logs(school_id,actor_id,action,resource_id) values(p_school,v_user,'class.created',v_class);
  insert into private.command_receipts(school_id,actor_id,operation,idempotency_key,request,resource_id)
    values(p_school,v_user,'class.create',p_key,v_request,v_class);
  return v_class;
end;
$$;
revoke all on function private.create_school_class(uuid,integer,text,text,uuid) from public,anon,authenticated;
grant execute on function private.create_school_class(uuid,integer,text,text,uuid) to authenticated;
-- Invoker wrapper exposes only the validated command. The definer implementation is not in an API schema.
create function public.create_school_class(p_school uuid,p_year integer,p_grade text,p_name text,p_key uuid)
returns uuid language sql security invoker set search_path = '' as $$
  select private.create_school_class(p_school,p_year,p_grade,p_name,p_key);
$$;
revoke all on function public.create_school_class(uuid,integer,text,text,uuid) from public,anon;
grant execute on function public.create_school_class(uuid,integer,text,text,uuid) to authenticated;
insert into public.curriculum_sources(id,issuer,title,url,edition,retrieved_at,sha256,location,verification,applicability,rights) values ('DBE-CAPS-MATH-2011','Department of Basic Education','CAPS Mathematics Grades 10–12','https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20FET%20_%20MATHEMATICS%20_%20GR%2010-12%20_%20Web_1133.pdf','2011','2026-10-14','042257c73d2ffcc843393e0d6b60aeca6a5cb9f2e81d255fc4e4db2ce56d3ad5','{"printed_page":40,"pdf_page":45,"section":"Grade 12 Term 1: Patterns, sequences, series"}','PDF text and rendered formula/page inspection','Base content reference; amendments and pilot review pending','Reference only; redistribution not approved');
insert into public.curriculum_sources(id,issuer,title,url,edition,retrieved_at,sha256,location,verification,applicability,rights) values ('DBE-ATP-MATH-G12-2023-24','Department of Basic Education','2023/24 Annual Teaching Plans: Mathematics Grade 12','https://www.education.gov.za/LinkClick.aspx?fileticket=_kS5tgxXQ0I%3d&tabid=3205&portalid=0&mid=10755','2023/24','2026-10-15','8c7075c87a8efda82a0e1085260baa1de0a3cf24cca3f2cfa058f06f9f76dc41','{"printed_pages":[1,2],"pdf_pages":[1,2],"section":"Term 1 weeks 1–4: Number patterns, sequences and series"}','Text retrieved; overview page rendered; subject approval pending','2026 retention supported by S19/2025; later/provincial directives and assessment review pending','Reference only; redistribution not approved');
insert into public.curriculum_sources(id,issuer,title,url,edition,retrieved_at,sha256,location,verification,applicability,rights) values ('DBE-S19-2025','Department of Basic Education','Circular S19 of 2025: retention of 2023/24 ATPs for 2026 with exclusions','https://www.education.gov.za/LinkClick.aspx?fileticket=fqHc5ZnT_q4%3D&mid=10757&portalid=0&tabid=3209','11 December 2025','2026-10-15','42b042245ba1afb2045a387ab36451c239fce16ab3f70f3fd25c92568cc169e1','{"pdf_pages":[1,2],"section":"Paragraph 5 and listed exclusions"}','Official DBE link, extracted text and rendered page 2 inspected','Grade 12 Mathematics outside listed exclusions; interpretation requires subject sign-off','Reference only');
insert into public.curriculum_sources(id,issuer,title,url,edition,retrieved_at,sha256,location,verification,applicability,rights) values ('DBE-ATP-INDEX','Department of Basic Education','Annual Teaching Plans official index','https://www.education.gov.za/Curriculum/NationalCurriculumStatementsGradesR-12/2023ATPs.aspx',null,'2026-10-15',null,'{}','Live page links S19/2025 and FET plan index','Discovery source, not independent curriculum approval','Reference only');
-- Foreign-key lookup indexes for authority changes and historical retention checks.
create index versions_reviewer_idx on public.curriculum_versions(reviewer_id);
create index curriculum_offerings_subject_idx on public.curriculum_offerings(subject_id,framework_id);
create index class_subjects_curriculum_idx on public.class_subjects(curriculum_offering_id,grade_code);
create index allocations_membership_idx on public.teaching_allocations(school_id,teacher_id,membership_role);
create index enrollments_membership_idx on public.enrollments(school_id,learner_id,membership_role);
create index guardian_links_learner_idx on public.guardian_links(school_id,learner_id,learner_role);
create index guardian_links_parent_idx on public.guardian_links(school_id,guardian_id,guardian_role);
create index guardian_links_verifier_idx on public.guardian_links(verified_by);
create index audit_logs_actor_idx on private.audit_logs(actor_id);
create index command_receipts_actor_idx on private.command_receipts(actor_id);
