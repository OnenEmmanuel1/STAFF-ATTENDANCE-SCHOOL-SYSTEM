const db = require('../config/db');

class AIService {
    constructor() { }

    async processQuery(query) {
        const lowerQuery = query.toLowerCase();
        let responseText = "I'm sorry, I didn't understand that. Try asking 'Who was late today?' or 'Show absent staff'.";
        let sql = null;
        let params = [];
        let isCount = false;

        try {
            // Rule 1: Who was late today?
            if (lowerQuery.includes('late') && (lowerQuery.includes('today') || lowerQuery.includes('today\'s'))) {
                sql = `
                    SELECT s.name, s.department, TIME_FORMAT(a.check_in_time, '%H:%i') as check_in_time 
                    FROM attendance a 
                    JOIN staff s ON a.staff_id = s.staff_id 
                    WHERE a.date = CURRENT_DATE AND a.status = 'Late'
                `;
                responseText = "Here are the staff members who are late today:";
            }
            // Rule 1b: Late Specific Date (simplistic - checks for 'yesterday')
            else if (lowerQuery.includes('late') && lowerQuery.includes('yesterday')) {
                sql = `
                    SELECT s.name, s.department, TIME_FORMAT(a.check_in_time, '%H:%i') as check_in_time 
                    FROM attendance a 
                    JOIN staff s ON a.staff_id = s.staff_id 
                    WHERE a.date = SUBDATE(CURRENT_DATE, 1) AND a.status = 'Late'
                `;
                responseText = "Here are the staff members who were late yesterday:";
            }
            // Rule 2: Who is absent today?
            else if (lowerQuery.includes('absent') && (lowerQuery.includes('today') || lowerQuery.includes('today\'s'))) {
                sql = `
                    SELECT s.name, s.department 
                    FROM staff s
                    WHERE s.staff_id NOT IN (
                        SELECT staff_id FROM attendance WHERE date = CURRENT_DATE
                    ) AND s.status = 'Active'
                `;
                responseText = "The following active staff members have not checked in today:";
            }
            // Rule 3: Count specific status
            else if (lowerQuery.includes('how many') && lowerQuery.includes('late')) {
                sql = `
                    SELECT COUNT(*) as count 
                    FROM attendance 
                    WHERE date = CURRENT_DATE AND status = 'Late'
                `;
                isCount = true;
                responseText = "Total late staff today:";
            }
            // Rule 4: Count absent
            else if (lowerQuery.includes('how many') && lowerQuery.includes('absent')) {
                sql = `
                    SELECT COUNT(*) as count 
                    FROM staff s
                    WHERE s.staff_id NOT IN (
                        SELECT staff_id FROM attendance WHERE date = CURRENT_DATE
                    ) AND s.status = 'Active'
                `;
                isCount = true;
                responseText = "Total absent staff today:";
            }

            // Execute if we have SQL
            if (sql) {
                const [rows] = await db.execute(sql, params);

                if (isCount) {
                    return { type: 'text', text: `${responseText} ${rows[0].count}` };
                }

                if (rows.length === 0) {
                    return { type: 'text', text: "No records found matching your query." };
                }

                return { type: 'data_list', text: responseText, data: rows };
            }

            return { type: 'text', text: responseText };

        } catch (error) {
            console.error("AI Processing Error:", error);
            return { type: 'error', text: "I encountered an error processing your request." };
        }
    }
}

module.exports = new AIService();
