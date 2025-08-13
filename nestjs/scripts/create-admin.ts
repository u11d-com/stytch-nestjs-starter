#!/usr/bin/env ts-node

if (process.argv.length < 2) {
  console.error('Usage: yarn create-admin <email>');
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

async function createSuperAdmin() {
  try {
    const url = `http://localhost:${port}/users`;

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

    console.log('Super admin created successfully:');
  } catch (error) {
    console.error('Failed to create super admin:', error);
    process.exit(1);
  }
}

void createSuperAdmin();
