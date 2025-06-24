const db = require('../../core/db');

class Task{
    static get tableName() {
        return 'tasks';
    }

    static get STATUS(){
        return{
            PENDING: 'PENDING',
            COMPLETED: 'COMPLETED'
        }
    }

    static async create({title, description, team_id, assigned_to}) {
        const [task] = await db(this.tableName)
        .insert({
            title: title.trim(),
            description: description ? description.trim() : null,
            team_id,
            assigned_to: assigned_to || null,
            status: this.STATUS.PENDING
        })
        .returning('*');

        return task;
    }

    static async findById(id){
        return await db(this.tableName)
        .select(
            'tasks.*',
            'teams.name as team_name',
            'users.username as assigned_to_username'
        )
        .leftJoin('teams','tasks.team_id','teams.id')
        .leftJoin('users','tasks.assigned_to','users.id')
        .where('tasks.id',id)
        .first();
    }

    static async update(id,updates){
        const updateData = {};
        if(updates.title) updateData.title = updates.title.trim();
        if(updates.description !== undefined) updateData.description = updates.description ? updates.description : null;
        if(updates.status) updateData.status = updates.status;
        if(updates.assigned_to !== undefined) updateData.assigned_to = updates.assigned_to;
        updateData.updated_at = new Date();

        const [task] = await db(this.tableName)
        .where({id})
        .update(updateData)
        .returning('*');

        return task;
    }

    static async delete(id) {
        const result = await db(this.tableName)
        .where({ id })
        .delete();

        return result > 0;
    }

    static async assign(taskId, userId) {
        return await this.update(taskId, { assigned_to: userId });
    }

    static async unassign(taskId) {
        return await this.update(taskId, { assigned_to: null });
    }

    static async markCompleted(taskId) {
        return await this.update(taskId, { status: this.STATUS.COMPLETED });
    }

    static async markPending(taskId) {
        return await this.update(taskId, { status: this.STATUS.PENDING });
    }

    static async findByTeamId(teamId) {
        return await db(this.tableName)
            .select(
                'tasks.*',
                'users.username as assigned_to_username'
            )
            .leftJoin('users', 'tasks.assigned_to', 'users.id')
            .where('tasks.team_id', teamId)
            .orderBy('tasks.created_at', 'desc');
    }

    static async findByAssignedUser(userId) {
        return await db(this.tableName)
        .select(
            'tasks.*',
            'teams.name as team_name'
        )
        .leftJoin('teams', 'tasks.team_id', 'teams.id')
        .where('tasks.assigned_to', userId)
        .orderBy('tasks.created_at', 'desc');
    }

    static async findByUserTeams(userId) {
        return await db(this.tableName)
        .select(
            'tasks.*',
            'teams.name as team_name',
            'users.username as assigned_to_username'
        )
        .leftJoin('teams', 'tasks.team_id', 'teams.id')
        .leftJoin('users', 'tasks.assigned_to', 'users.id')
        .join('memberships', 'teams.id', 'memberships.team_id')
        .where('memberships.user_id', userId)
        .orderBy('tasks.created_at', 'desc');
    }

    static async search(query, teamId = null) {
        const searchTerm = `%${query.toLowerCase().trim()}%`;
        
        let dbQuery = db(this.tableName)
        .select(
            'tasks.*',
            'teams.name as team_name',
            'users.username as assigned_to_username'
        )
        .leftJoin('teams', 'tasks.team_id', 'teams.id')
        .leftJoin('users', 'tasks.assigned_to', 'users.id')
        .where(function() {
            this.whereRaw('LOWER(tasks.title) LIKE ?', [searchTerm])
                .orWhereRaw('LOWER(tasks.description) LIKE ?', [searchTerm]);
        });

        if (teamId) {
        dbQuery = dbQuery.where('tasks.team_id', teamId);
        }

        return await dbQuery.orderBy('tasks.created_at', 'desc');
    }

    static async findByStatus(status, teamId = null) {
        let query = db(this.tableName)
        .select(
            'tasks.*',
            'teams.name as team_name',
            'users.username as assigned_to_username'
        )
        .leftJoin('teams', 'tasks.team_id', 'teams.id')
        .leftJoin('users', 'tasks.assigned_to', 'users.id')
        .where('tasks.status', status);

        if (teamId) {
        query = query.where('tasks.team_id', teamId);
        }

        return await query.orderBy('tasks.created_at', 'desc');
    }

    static async canUserAccess(taskId, userId) {
        const result = await db(this.tableName)
        .select('tasks.id')
        .join('teams', 'tasks.team_id', 'teams.id')
        .join('memberships', 'teams.id', 'memberships.team_id')
        .where('tasks.id', taskId)
        .where('memberships.user_id', userId)
        .first();

        return !!result;
    }

    static async getTeamTaskCount(teamId) {
        const result = await db(this.tableName)
        .count('id as count')
        .where('team_id', teamId)
        .first();

        return parseInt(result.count) || 0;
    }

    static async getUserTaskCount(userId) {
        const result = await db(this.tableName)
        .count('id as count')
        .where('assigned_to', userId)
        .first();

        return parseInt(result.count) || 0;
    }

    static async exists(id) {
        const result = await db(this.tableName)
        .select('id')
        .where({ id })
        .first();

        return !!result;
    }
}

module.exports = Task;