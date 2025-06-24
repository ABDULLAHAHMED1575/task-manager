const db = require('../../core/db');

class Team {
    static get tableName() {
        return 'teams';
    }

    static async create({name,description}, creatorId){
        const trx = await db.transaction();
        try {
            const [team] = await trx(this.tableName)
            .insert({
                name: name.trim(),
                description: description ? description.trim() : null,
            })
            .returning('*');

            await trx('memberships')
            .insert({
                user_id: creatorId,
                team_id: team.id
            });

            await trx.commit();
            return team;
        } catch (error) {
            await trx.rollback();

            if(error.code === '23505'){
                throw new Error('Team name already exists');
            }
            throw error;
        }
    }

    static async findById(id) {
        return await db(this.tableName)
        .select('*')
        .where({ id })
        .first();
    }

    static async findByName(name) {
        return await db(this.tableName)
        .select('*')
        .where({ name: name.trim() })
        .first();
    }

    static async update(id, updates) {
        const updateData = {};

        if (updates.name) updateData.name = updates.name.trim();
        if (updates.description !== undefined) updateData.description = updates.description ? updates.description.trim() : null;
        updateData.updated_at = new Date();

        const [team] = await db(this.tableName)
        .where({ id })
        .update(updateData)
        .returning('*');

        return team;
    }

        static async findByIdWithStats(id) {
            const team = await db(this.tableName)
                .select(
                    'teams.*',
                    db.raw('COUNT(DISTINCT memberships.user_id) as member_count'),
                    db.raw('COUNT(DISTINCT tasks.id) as total_tasks'),
                    db.raw('COUNT(DISTINCT CASE WHEN tasks.status = \'PENDING\' THEN tasks.id END) as pending_tasks'),
                    db.raw('COUNT(DISTINCT CASE WHEN tasks.status = \'COMPLETED\' THEN tasks.id END) as completed_tasks')
                )
                .leftJoin('memberships', 'teams.id', 'memberships.team_id')
                .leftJoin('tasks', 'teams.id', 'tasks.team_id')
                .where('teams.id', id)
                .groupBy('teams.id')
                .first();

            if (team) {
                team.member_count = parseInt(team.member_count) || 0;
                team.total_tasks = parseInt(team.total_tasks) || 0;
                team.pending_tasks = parseInt(team.pending_tasks) || 0;
                team.completed_tasks = parseInt(team.completed_tasks) || 0;
                team.completion_rate = team.total_tasks > 0 ? 
                    Math.round((team.completed_tasks / team.total_tasks) * 100) : 0;
            }

            return team;
        }

    static async delete(id) {
        const result = await db(this.tableName)
        .where({ id })
        .delete();

        return result > 0;
    }
    
    static async getStatistics(teamId) {
        const taskStats = await db('tasks')
            .select(
                db.raw('COUNT(*) as total_tasks'),
                db.raw('COUNT(CASE WHEN status = \'PENDING\' THEN 1 END) as pending_tasks'),
                db.raw('COUNT(CASE WHEN status = \'COMPLETED\' THEN 1 END) as completed_tasks'),
                db.raw('COUNT(CASE WHEN assigned_to IS NOT NULL THEN 1 END) as assigned_tasks'),
                db.raw('COUNT(CASE WHEN assigned_to IS NULL THEN 1 END) as unassigned_tasks')
            )
            .where('team_id', teamId)
            .first();

        const memberStats = await db('memberships')
            .count('user_id as member_count')
            .where('team_id', teamId)
            .first();

        const totalTasks = parseInt(taskStats.total_tasks) || 0;
        const completedTasks = parseInt(taskStats.completed_tasks) || 0;
        const completionRate = totalTasks > 0 ? 
            Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            member_count: parseInt(memberStats.member_count) || 0,
            
            total_tasks: totalTasks,
            pending_tasks: parseInt(taskStats.pending_tasks) || 0,
            completed_tasks: completedTasks,
            assigned_tasks: parseInt(taskStats.assigned_tasks) || 0,
            unassigned_tasks: parseInt(taskStats.unassigned_tasks) || 0,
            completion_rate: completionRate,
            assignment_rate: totalTasks > 0 ? 
                Math.round((parseInt(taskStats.assigned_tasks) / totalTasks) * 100) : 0
        };
    }

    static async getMembers(teamId) {
        return await db('users')
        .select('users.id', 'users.username', 'users.email')
        .join('memberships', 'users.id', 'memberships.user_id')
        .where('memberships.team_id', teamId);
    }

    static async addMember(teamId, userId) {
        try {
            const [membership] = await db('memberships')
                .insert({
                team_id: teamId,
                user_id: userId
                })
                .returning('*');

            return membership;
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('User is already a member of this team');
            }
            throw error;
        }
    }

    static async removeMember(teamId, userId){
        const result = await db('memberships')
        .where({
            team_id:teamId,
            user_id:userId
        })
        .delete();
        return result>0
    }

    static async isMember(teamId,userId){
        const membership = await db('memberships')
        .select('id')
        .where({
            team_id:teamId,
            user_id:userId,
        })
        .first();

        return !!membership;
    }

    static async findByUserId(userId){
        return await db(this.tableName)
        .select('teams.*')
        .join('memberships','teams.id','memberships.team_id')
        .where('memberships.user_id',userId)
        .orderBy('teams.created_at','desc');
    }

    static async getTasks(teamId){
        return await db('tasks')
        .select('tasks.*', 'users.username as assigned_to_username')
        .leftJoin('users','tasks.assigned_to','users.id')
        .where('tasks.team_id',teamId)
        .orderBy('tasks.created_at','desc');
    }

    static async exists(id){
        const result = await db(this.tableName)
        .select('id')
        .where({id})
        .first();

        return !!result;
    }
}

module.exports = Team;