import { PrismaClient } from '@prisma/client';
import { IUserRepository} from '../../domain/repositories/IUserRepository';
import { User, UserRole } from '../../domain/entities/User';

export class PrismaUserRepository implements IUserRepository {
    constructor(private prisma: PrismaClient) {}

    async create(user: User): Promise<User> {
        const created = await this.prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                password: user.password,
                role: user.role,
                name: user.name,
                avatar: user.avatar,
                timezone: user.timezone,
            },
        });

        return this.toDomain(created);
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        return user ? this.toDomain(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        return user ? this.toDomain(user) : null;
    }

    async findAll(): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            orderBy: { name: 'asc' },
        });

        return users.map(user => this.toDomain(user));
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id },
        });
    }

    async existsByEmail(email: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
        return !!user;
    }

    private toDomain(user: any): User {
        return new User(
            user.id,
            user.email,
            user.password,
            user.role as UserRole,
            user.name,
            user.avatar,
            user.timezone,
            user.createdAt,
            user.updatedAt
        );
    }
}