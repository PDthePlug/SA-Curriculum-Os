export const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
export const identityFixture = `insert into auth.users(id) select ('00000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid from generate_series(1,10) i;
    insert into public.schools(id,name) values ('${id(101)}','Synthetic school A'),('${id(102)}','Synthetic school B');
    insert into public.school_memberships(school_id,user_id,role) values
      ('${id(101)}','${id(1)}','school_admin'),('${id(102)}','${id(2)}','school_admin'),
      ('${id(101)}','${id(3)}','teacher'),('${id(101)}','${id(4)}','teacher'),
      ('${id(101)}','${id(5)}','learner'),('${id(101)}','${id(6)}','learner'),
      ('${id(102)}','${id(7)}','learner'),('${id(101)}','${id(8)}','parent'),
      ('${id(101)}','${id(9)}','learner');
    update public.school_memberships set valid_to=now()-interval '1 hour',valid_from=now()-interval '2 hours' where user_id='${id(9)}';
    insert into public.academic_years(id,school_id,year,starts_on,ends_on) values ('${id(201)}','${id(101)}',2026,'2026-01-01','2026-12-31'),('${id(202)}','${id(102)}',2026,'2026-01-01','2026-12-31');
    insert into public.classes(id,school_id,academic_year_id,grade_code,name) values
      ('${id(301)}','${id(101)}','${id(201)}','12','12A'),('${id(302)}','${id(101)}','${id(201)}','12','12B'),('${id(303)}','${id(102)}','${id(202)}','12','12A');
    insert into public.curriculum_frameworks(id,code,name,jurisdiction) values ('${id(401)}','TEST','Synthetic','ZA');
    insert into public.curriculum_versions(id,framework_id,edition,state,applicable_year,reviewer_id,reviewed_at) values ('${id(402)}','${id(401)}','test','published',2026,'${id(1)}',now()),('${id(409)}','${id(401)}','draft','draft',2026,null,null);
    insert into public.subjects(id,framework_id,code,phase,name) values ('${id(403)}','${id(401)}','MATH','FET','Mathematics'),('${id(404)}','${id(401)}','ACC','FET','Accounting');
    insert into public.curriculum_offerings(id,framework_id,curriculum_version_id,subject_id,grade_code) values ('${id(405)}','${id(401)}','${id(402)}','${id(403)}','12'),('${id(406)}','${id(401)}','${id(402)}','${id(404)}','12');
    insert into public.class_subjects(id,school_id,class_id,grade_code,curriculum_offering_id) values
      ('${id(501)}','${id(101)}','${id(301)}','12','${id(405)}'),('${id(502)}','${id(101)}','${id(302)}','12','${id(406)}'),('${id(503)}','${id(102)}','${id(303)}','12','${id(405)}');
    insert into public.teaching_allocations(school_id,class_subject_id,teacher_id) values ('${id(101)}','${id(501)}','${id(3)}'),('${id(101)}','${id(502)}','${id(4)}');
    insert into public.enrollments(school_id,class_subject_id,learner_id) values ('${id(101)}','${id(501)}','${id(5)}'),('${id(101)}','${id(502)}','${id(6)}'),('${id(102)}','${id(503)}','${id(7)}');`;
