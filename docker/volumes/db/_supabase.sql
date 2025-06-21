\set pguser `echo "$POSTGRES_USER"`

CxxxxxREATE DATABASE _supabase WITH OWNER :pguser;
