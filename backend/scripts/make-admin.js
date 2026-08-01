const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error("Please provide an email address.");
        console.error("Usage: node scripts/make-admin.js <email>");
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log(`Successfully updated ${user.email} to ADMIN role.`);
    } catch (error) {
        if (error.code === 'P2025') {
            console.error(`User with email ${email} not found.`);
        } else {
            console.error("An error occurred:", error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
