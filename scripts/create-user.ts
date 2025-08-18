#!/usr/bin/env ts-node

if (process.argv.length < 3) {
  console.error('Usage: yarn create-user <email>');
  process.exit(1);
}

const email = process.argv[2];
const firstName = 'Super';
const lastName = 'Admin';
const port = process.env.PORT || 3000;
const masterKey = process.env.MASTER_KEY;

if (!masterKey) {
  console.error('MASTER_KEY is not defined in .env file');
  process.exit(1);
}

async function createUser() {
  try {
    const url = `http://localhost:${port}/auth/invite`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': masterKey || '',
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('User created successfully!');
    console.log(`An invitation email has been sent to: ${email}`);
    console.log('The user will receive a magic link to set their password.');
  } catch (error) {
    console.error('Failed to create user:', error);
    process.exit(1);
  }
}

void createUser();
