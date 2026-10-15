create index class_subjects_class_grade_idx on public.class_subjects(school_id,class_id,grade_code);
create index curriculum_offerings_version_framework_idx on public.curriculum_offerings(curriculum_version_id,framework_id);
create index curriculum_offerings_framework_idx on public.curriculum_offerings(framework_id);
create index guardian_links_learner_user_idx on public.guardian_links(learner_id);
-- Explicit deny documents intentional private-only and future-parent boundaries.
create policy audit_client_denied on private.audit_logs for all to anon,authenticated using(false) with check(false);
create policy receipts_client_denied on private.command_receipts for all to anon,authenticated using(false) with check(false);
create policy guardian_client_denied on public.guardian_links for all to anon,authenticated using(false) with check(false);
