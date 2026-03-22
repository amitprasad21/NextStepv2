/**
 * Make a user admin by email.
 *
 * Usage: node scripts/make-admin.mjs <email> <password>
 *
 * This script:
 * 1. Creates the auth user if they don't exist (via admin API)
 * 2. Ensures public.users record exists with role='admin'
 * 3. Ensures admin_users record exists
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load env
const envPath = resolve(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
})

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Usage: node scripts/make-admin.mjs <email> <password>')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  console.log(`\nMaking ${email} an admin...\n`)

  // Step 1: Check if auth user exists, create if not
  const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
  if (listErr) {
    console.error('Error listing users:', listErr.message)
    process.exit(1)
  }

  let authUser = users.find(u => u.email === email)

  if (!authUser) {
    console.log('Auth user not found, creating...')
    const { data, error: createErr } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (createErr) {
      console.error('Error creating auth user:', createErr.message)
      process.exit(1)
    }
    authUser = data.user
    console.log('Auth user created:', authUser.id)
  } else {
    console.log('Auth user found:', authUser.id)
    // Update password to ensure it matches
    const { error: updateErr } = await sb.auth.admin.updateUserById(authUser.id, {
      password,
      email_confirm: true,
    })
    if (updateErr) {
      console.error('Warning: Could not update password:', updateErr.message)
    } else {
      console.log('Password updated.')
    }
  }

  // Step 2: Upsert public.users record with role='admin'
  const { data: existingUser } = await sb
    .from('users')
    .select('id, role')
    .eq('auth_id', authUser.id)
    .single()

  if (existingUser) {
    if (existingUser.role !== 'admin') {
      const { error } = await sb
        .from('users')
        .update({ role: 'admin' })
        .eq('id', existingUser.id)
      if (error) {
        console.error('Error updating role:', error.message)
        process.exit(1)
      }
      console.log('Role updated to admin.')
    } else {
      console.log('Already admin in public.users.')
    }
  } else {
    const { error } = await sb.from('users').insert({
      auth_id: authUser.id,
      email,
      role: 'admin',
      is_verified: true,
    })
    if (error) {
      console.error('Error inserting user:', error.message)
      process.exit(1)
    }
    console.log('public.users record created with role=admin.')
  }

  // Step 3: Ensure admin_users record exists
  const { data: dbUser } = await sb
    .from('users')
    .select('id')
    .eq('auth_id', authUser.id)
    .single()

  if (dbUser) {
    const { data: existingAdmin } = await sb
      .from('admin_users')
      .select('id')
      .eq('user_id', dbUser.id)
      .single()

    if (!existingAdmin) {
      const { error } = await sb.from('admin_users').insert({
        user_id: dbUser.id,
        department: 'management',
      })
      if (error) {
        console.error('Error creating admin_users record:', error.message)
      } else {
        console.log('admin_users record created.')
      }
    } else {
      console.log('admin_users record already exists.')
    }
  }

  console.log(`\nDone! ${email} is now an admin.`)
  console.log(`Login: ${email} / ${password}`)
  console.log(`They will be redirected to /admin after login.\n`)
}

main().catch(console.error)
