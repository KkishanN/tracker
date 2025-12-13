const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Connecting to DB...')
        await prisma.$connect()
        console.log('Connected!')

        const userCount = await prisma.user.count()
        console.log('User count:', userCount)

        const subjectCount = await prisma.subject.count()
        console.log('Subject count:', subjectCount)

    } catch (e) {
        console.error('DB Error:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
