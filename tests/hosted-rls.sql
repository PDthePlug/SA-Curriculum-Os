begin;
insert into auth.users(id) select ('00000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid from generate_series(1,10) i;
    insert into public.schools(id,name) values ('00000000-0000-4000-8000-000000000101','Synthetic school A'),('00000000-0000-4000-8000-000000000102','Synthetic school B');
    insert into public.school_memberships(school_id,user_id,role) values
      ('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000001','school_admin'),('00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000002','school_admin'),
      ('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000003','teacher'),('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000004','teacher'),
      ('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000005','learner'),('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000006','learner'),
      ('00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000007','learner'),('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000008','parent'),
      ('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000009','learner');
    update public.school_memberships set valid_to=now()-interval '1 hour',valid_from=now()-interval '2 hours' where user_id='00000000-0000-4000-8000-000000000009';
    insert into public.academic_years(id,school_id,year,starts_on,ends_on) values ('00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000101',2026,'2026-01-01','2026-12-31'),('00000000-0000-4000-8000-000000000202','00000000-0000-4000-8000-000000000102',2026,'2026-01-01','2026-12-31');
    insert into public.classes(id,school_id,academic_year_id,grade_code,name) values
      ('00000000-0000-4000-8000-000000000301','00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000201','12','12A'),('00000000-0000-4000-8000-000000000302','00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000201','12','12B'),('00000000-0000-4000-8000-000000000303','00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000202','12','12A');
    insert into public.curriculum_frameworks(id,code,name,jurisdiction) values ('00000000-0000-4000-8000-000000000401','TEST','Synthetic','ZA');
    insert into public.curriculum_versions(id,framework_id,edition,state,applicable_year,reviewer_id,reviewed_at) values ('00000000-0000-4000-8000-000000000402','00000000-0000-4000-8000-000000000401','test','published',2026,'00000000-0000-4000-8000-000000000001',now()),('00000000-0000-4000-8000-000000000409','00000000-0000-4000-8000-000000000401','draft','draft',2026,null,null);
    insert into public.subjects(id,framework_id,code,phase,name) values ('00000000-0000-4000-8000-000000000403','00000000-0000-4000-8000-000000000401','MATH','FET','Mathematics'),('00000000-0000-4000-8000-000000000404','00000000-0000-4000-8000-000000000401','ACC','FET','Accounting');
    insert into public.curriculum_offerings(id,framework_id,curriculum_version_id,subject_id,grade_code) values ('00000000-0000-4000-8000-000000000405','00000000-0000-4000-8000-000000000401','00000000-0000-4000-8000-000000000402','00000000-0000-4000-8000-000000000403','12'),('00000000-0000-4000-8000-000000000406','00000000-0000-4000-8000-000000000401','00000000-0000-4000-8000-000000000402','00000000-0000-4000-8000-000000000404','12');
    insert into public.class_subjects(id,school_id,class_id,grade_code,curriculum_offering_id) values
      ('00000000-0000-4000-8000-000000000501','00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000301','12','00000000-0000-4000-8000-000000000405'),('00000000-0000-4000-8000-000000000502','00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000302','12','00000000-0000-4000-8000-000000000406'),('00000000-0000-4000-8000-000000000503','00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000303','12','00000000-0000-4000-8000-000000000405');
    insert into public.teaching_allocations(school_id,class_subject_id,teacher_id) values ('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000501','00000000-0000-4000-8000-000000000003'),('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000502','00000000-0000-4000-8000-000000000004');
    insert into public.enrollments(school_id,class_subject_id,learner_id) values ('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000501','00000000-0000-4000-8000-000000000005'),('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000502','00000000-0000-4000-8000-000000000006'),('00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000503','00000000-0000-4000-8000-000000000007');
reset role; select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true); set local role authenticated;
do $$begin if (select count(*) from public.schools)<>1 then raise exception 'Hosted RLS failed: schools expected 1'; end if; end$$;
do $$begin if (select count(*) from public.classes)<>2 then raise exception 'Hosted RLS failed: classes expected 2'; end if; end$$;
reset role; select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000003',true); set local role authenticated;
do $$begin if (select count(*) from public.enrollments)<>1 then raise exception 'Hosted RLS failed: enrollments expected 1'; end if; end$$;
do $$begin if (select count(*) from public.class_subjects)<>1 then raise exception 'Hosted RLS failed: class_subjects expected 1'; end if; end$$;
reset role; select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000005',true); set local role authenticated;
do $$begin if (select count(*) from public.enrollments)<>1 then raise exception 'Hosted RLS failed: enrollments expected 1'; end if; end$$;
do $$begin if (select count(*) from public.classes)<>1 then raise exception 'Hosted RLS failed: classes expected 1'; end if; end$$;
reset role; select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000008',true); set local role authenticated;
do $$begin if (select count(*) from public.classes)<>0 then raise exception 'Hosted RLS failed: classes expected 0'; end if; end$$;
reset role; select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000009',true); set local role authenticated;
do $$begin if (select count(*) from public.schools)<>0 then raise exception 'Hosted RLS failed: schools expected 0'; end if; end$$;
reset role; select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true); set local role authenticated;
select public.create_school_class('00000000-0000-4000-8000-000000000101',2027,'12','Hosted check','00000000-0000-4000-8000-000000000950');
select public.create_school_class('00000000-0000-4000-8000-000000000101',2027,'12','Hosted check','00000000-0000-4000-8000-000000000950');
do $$begin if (select count(*) from public.classes)<>3 then raise exception 'Hosted RLS failed: classes expected 3'; end if; end$$;
reset role;
update public.school_memberships set status='revoked' where user_id='00000000-0000-4000-8000-000000000001';
reset role; select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true); set local role authenticated;
do $$begin if (select count(*) from public.schools)<>0 then raise exception 'Hosted RLS failed: schools expected 0'; end if; end$$;
do $$begin begin perform public.create_school_class('00000000-0000-4000-8000-000000000101',2027,'12','Hosted check','00000000-0000-4000-8000-000000000950'); exception when insufficient_privilege then return; end; raise exception 'Revoked administrator command unexpectedly succeeded'; end$$;
reset role;
do $$begin if (select count(*) from private.audit_logs)<>1 then raise exception 'Idempotency audit failed'; end if; end$$;
rollback;
select 'PASS: hosted role isolation, parent/expiry denial, idempotency and live revocation; all fixtures rolled back' as result;