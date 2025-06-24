const db = require('../../core/db');

class Membership{
    static get tableName(){
        return 'memberships';
    }

    static async create(userId,teamId){
        try {
            const [membership] = await db(this.tableName)
            .insert({
                user_id:userId,
                team_id:teamId
            })
            .returning('*');
            return membership;
        } catch (error) {
            if(error.code === '23505'){
                throw new Error('User is already a member of this team');
            }
            if (error.code === '23503') {
                throw new Error('Invalid user or team ID');
            }
            throw error;
        }
    }

    static async findByUserAndTeam(userId,teamId){
        return await db(this.tableName)
        .select('*')
        .where({
            user_id:userId,
            team_id:teamId
        })
        .first();
    }

    static async deleteUser(userId,teamId){
        const result = await db(this.tableName)
        .where({
            user_id:userId,
            team_id:teamId
        })
        .delete();
        return result>0;
    }

    static async exists(userId,teamId){
        const membership = await db(this.tableName)
        .select('id')
        .where({
            user_id:userId,
            team_id:teamId
        })
        .first();

        return !!membership;
    }

    static async getTeamMembers(teamId){
        return await db(this.tableName)
        .select(
            'user.id',
            'user.username',
            'user.email',
            'memberships.created_at as joined_at'
        )
        .join('users','memberships.user_id','user.id')
        .where('memberships.team_id',teamId)
        .orderBy('memberships.created_at','asc')
    }

    static async getUserTeams(userId) {
        return await db(this.tableName)
        .select(
            'teams.id',
            'teams.name',
            'teams.description',
            'teams.created_at',
            'memberships.created_at as joined_at'
        )
        .join('teams', 'memberships.team_id', 'teams.id')
        .where('memberships.user_id', userId)
        .orderBy('memberships.created_at', 'desc');
    }

    static async getTeamMemberCount(teamId) {
        const result = await db(this.tableName)
        .count('user_id as count')
        .where('team_id', teamId)
        .first();

        return parseInt(result.count) || 0;
    }

    static async getUserTeamCount(userId) {
        const result = await db(this.tableName)
        .count('team_id as count')
        .where('user_id', userId)
        .first();

        return parseInt(result.count) || 0;
    }

    static async removeMultipleUsers(userIds, teamId) {
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return 0;
        }

        const result = await db(this.tableName)
            .where('team_id', teamId)
            .whereIn('user_id', userIds)
            .delete();

        return result;
    }

    static async addMultipleUsers(userIds, teamId) {
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return [];
        }

        const memberships = userIds.map(userId => ({
            user_id: userId,
            team_id: teamId
        }));

        try {
            const result = await db(this.tableName)
                .insert(memberships)
                .returning('*');

            return result;
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('One or more users are already members of this team');
            }
            throw error;
        }
    }

    static async wouldLeaveTeamEmpty(userId, teamId) {
        const memberCount = await this.getTeamMemberCount(teamId);
        const userIsMember = await this.exists(userId, teamId);
        
        return userIsMember && memberCount === 1;
    }

    static async getAllMemberships() {
        return await db(this.tableName)
            .select(
                'memberships.*',
                'users.username',
                'users.email',
                'teams.name as team_name'
            )
            .join('users', 'memberships.user_id', 'users.id')
            .join('teams', 'memberships.team_id', 'teams.id')
            .orderBy('memberships.created_at', 'desc');
    }
}

module.exports = Membership