import { infotransporter } from "./function.js";

export async function send_mail(email, assignee_name, task_name, project_name, estimated_task_end_date, priority, task_status, task_reporter,task_reporter_email, username, type) {
    let type_data = '';
    if (type === 'project') {
        type_data = 'Project';

    }
    else if (type === 'lead') {
        type_data = 'lead';
    }
    else {
        type_data = 'task';
    }
    const mailOptions = {
        from: process.env.INFO_USER_EMAIL,
        to:[email, task_reporter_email],
        subject: "Task Manager | Task Notification",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #0073e6; padding: 15px; text-align: center; border-radius: 10px 10px 0 0;">
                <h2 style="color: #fff; margin: 0;">Task Notification</h2>
            </div>
            <div style="padding: 20px;">
                <p>Dear <strong>$Team</strong>,</p>
                <p>We hope this email finds you well. You have been assigned a new task in <strong>Task Manager</strong>.</p>
                
                <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <h3 style="color: #333; text-align: center; margin-bottom: 10px;">🔹 Task Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Task Name:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${task_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${type_data}:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${project_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Due Date:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${estimated_task_end_date}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Priority:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd; color: ${priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green'};">
                                ${priority}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;border-bottom: 1px solid #ddd; "><strong>Status:</strong></td>
                            <td style="padding: 8px;border-bottom: 1px solid #ddd; ">${task_status}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; "><strong>Task assignee:</strong></td>
                            <td style="padding: 8px;; ">${assignee_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; "><strong>Report to:</strong></td>
                            <td style="padding: 8px;; ">${task_reporter}</td>
                        </tr>
                    </table>
                </div>

                <p>If you have any questions, feel free to reach out.</p>

                

                <p>Best regards,<br><strong>${username}</strong></p>
            </div>
        </div>
    `,
    };


    infotransporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.log(error);

        }
        else {
            console.log("Email sent: " + info.response);
        }
    });

}

export async function send_mail_subtask(email, assignee_name, sub_task_name, project_name, estimated_task_end_date, priority, task_status, task_reporter,reporter_email, username, task_name, type) {
    let type_data = '';
    if (type === 'project') {
        type_data = 'Project';

    }
    else if (type === 'lead') {
        type_data = 'lead';
    }
    else {
        type_data = 'task';
    }
    const mailOptions = {
        from: process.env.INFO_USER_EMAIL,
        to: [email, reporter_email],
        subject: "Sub Task Manager | Sub Task Notification",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #0073e6; padding: 15px; text-align: center; border-radius: 10px 10px 0 0;">
                <h2 style="color: #fff; margin: 0;">Sub Task Notification</h2>
            </div>
            <div style="padding: 20px;">
                <p>Dear <strong>Teams</strong>,</p>
                <p>We hope this email finds you well. You have been assigned a new sub task in <strong>Task Manager</strong>.</p>
                
                <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <h3 style="color: #333; text-align: center; margin-bottom: 10px;">🔹 Sub Task Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Sub Task Name:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${sub_task_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Task Name:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${task_name}</td>
                        </tr>

                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${type_data}:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${project_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Due Date:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${estimated_task_end_date}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Priority:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd; color: ${priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green'};">
                                ${priority}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;border-bottom: 1px solid #ddd; "><strong>Status:</strong></td>
                            <td style="padding: 8px;border-bottom: 1px solid #ddd; ">${task_status}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; "><strong>Assignee:</strong></td>
                            <td style="padding: 8px;; ">${assignee_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; "><strong>Report to:</strong></td>
                            <td style="padding: 8px;; ">${task_reporter}</td>
                        </tr>
                    </table>
                </div>

                <p>If you have any questions, feel free to reach out.</p>

                

                <p>Best regards,<br><strong>${username}</strong></p>
            </div>
        </div>
    `,
    };


    infotransporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.log(error);

        }
        else {
            console.log("Email sent: " + info.response);
        }
    });

}
export async function send_mail_minitask(email, assignee_name, sub_task_name, project_name, estimated_task_end_date, priority, task_status, task_reporter,reporter_email, username, task_name, type) {
    let type_data = '';
    if (type === 'project') {
        type_data = 'Project';

    }
    else if (type === 'lead') {
        type_data = 'lead';
    }
    else {
        type_data = 'task';
    }
    const mailOptions = {
        from: process.env.INFO_USER_EMAIL,
        to: [email, reporter_email],
        subject: "Mini Task Manager | Mini Task Notification",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #0073e6; padding: 15px; text-align: center; border-radius: 10px 10px 0 0;">
                <h2 style="color: #fff; margin: 0;">Sub Task Notification</h2>
            </div>
            <div style="padding: 20px;">
                <p>Dear <strong>Teams</strong>,</p>
                <p>We hope this email finds you well. You have been assigned a new mini task in <strong>Task Manager</strong>.</p>
                
                <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <h3 style="color: #333; text-align: center; margin-bottom: 10px;">🔹 Sub Task Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Mini Task Name:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${sub_task_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Task Name:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${task_name}</td>
                        </tr>

                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${type_data}:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${project_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Due Date:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${estimated_task_end_date}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Priority:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #ddd; color: ${priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green'};">
                                ${priority}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;border-bottom: 1px solid #ddd; "><strong>Status:</strong></td>
                            <td style="padding: 8px;border-bottom: 1px solid #ddd; ">${task_status}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; "><strong>Assignee:</strong></td>
                            <td style="padding: 8px;; ">${assignee_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; "><strong>Report to:</strong></td>
                            <td style="padding: 8px;; ">${task_reporter}</td>
                        </tr>
                    </table>
                </div>

                <p>If you have any questions, feel free to reach out.</p>

                

                <p>Best regards,<br><strong>${username}</strong></p>
            </div>
        </div>
    `,
    };


    infotransporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.log(error);

        }
        else {
            console.log("Email sent: " + info.response);
        }
    });

}


export async function send_mail_task_cronjob(email, assignee_name, task_name, project_name, estimated_task_end_date, priority, task_status, task_reporter, type){
    const isOverdue = new Date(estimated_task_end_date) < new Date();
    let type_data = '';
    if (type === 'project') {
        type_data = 'Project';

    }
    else if (type === 'lead') {
        type_data = 'lead';
    }
    else {
        type_data = 'task';
    }
    const mailOptions = {
        from: process.env.INFO_USER_EMAIL,
        to: [email,],
        subject: `🚨 IMPORTANT: Overdue Task Alert - ${task_name}`,
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 2px solid red; border-radius: 10px; padding: 20px; background-color: #fff5f5;">
        <div style="background-color: #d32f2f; padding: 15px; text-align: center; border-radius: 10px 10px 0 0;">
            <h2 style="color: #fff; margin: 0;">⚠️ Task Overdue Alert</h2>
        </div>
        <div style="padding: 20px;">
            <p>Dear <strong>Teams</strong>,</p>
            <p style="color: red; font-weight: bold;">🚨 This is an important notification regarding your assigned task.</p>
            <p>The task <strong>${task_name}</strong> in <strong>Task Manager</strong> has exceeded its due date. Please take immediate action!</p>

            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h3 style="color: #333; text-align: center; margin-bottom: 10px;">🔹 Task Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Task Name:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${task_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${type_data}:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${project_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Due Date:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; color: red; font-weight: bold;">
                            ${estimated_task_end_date} (Overdue) ${isOverdue ? '🔥' : ''}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Priority:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; color: ${priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green'};">
                            ${priority}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;border-bottom: 1px solid #ddd;"><strong>Status:</strong></td>
                        <td style="padding: 8px;border-bottom: 1px solid #ddd;">${task_status}</td>
                    </tr>
                     <tr>
                        <td style="padding: 8px;"><strong>Task assingee:</strong></td>
                        <td style="padding: 8px;">${assignee_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;"><strong>Report to:</strong></td>
                        <td style="padding: 8px;">${task_reporter}</td>
                    </tr>
                </table>
            </div>

            <p style="color: red; font-weight: bold; text-align: center;">⚠️ <strong>${assignee_name}</strong>, please take immediate action on this overdue task.</p>
            <p style="text-align: center;"><strong>${task_reporter}</strong>, kindly follow up on this matter.</p>

            <p>If you have any questions, please reach out immediately.</p>

        </div>
    </div>
    `,
    };

    infotransporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.log(error);

        }
        else {
            console.log("Email sent: " + info.response);
        }
    });

}

export async function send_mail_subtask_cronjob(email, assignee_name, sub_task_name, project_name, estimated_task_end_date, priority, task_status, task_reporter,task_name, type) {
    const isOverdue = new Date(estimated_task_end_date) < new Date();
    let type_data = '';
    if (type === 'project') {
        type_data = 'Project';

    }
    else if (type === 'lead') {
        type_data = 'lead';
    }
    else {
        type_data = 'task';
    }
    const mailOptions = {
        from: process.env.INFO_USER_EMAIL,
        to: email,
        subject: `🚨 IMPORTANT: Overdue Sub Task Alert - ${sub_task_name}`,
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 2px solid red; border-radius: 10px; padding: 20px; background-color: #fff5f5;">
        <div style="background-color: #d32f2f; padding: 15px; text-align: center; border-radius: 10px 10px 0 0;">
            <h2 style="color: #fff; margin: 0;">⚠️ SubTask Overdue Alert</h2>
        </div>
        <div style="padding: 20px;">
            <p>Dear <strong>Teams</strong>,</p>
            <p style="color: red; font-weight: bold;">🚨 This is an important notification regarding your assigned task.</p>
            <p>The subtask <strong>${sub_task_name}</strong> in <strong>Task Manager</strong> has exceeded its due date. Please take immediate action!</p>

            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h3 style="color: #333; text-align: center; margin-bottom: 10px;">🔹  Sub Task Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>SubTask Name:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${sub_task_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Task Name:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${task_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${type_data}:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${project_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Due Date:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; color: red; font-weight: bold;">
                            ${estimated_task_end_date} (Overdue) ${isOverdue ? '🔥' : ''}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Priority:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; color: ${priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green'};">
                            ${priority}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;border-bottom: 1px solid #ddd;"><strong>Status:</strong></td>
                        <td style="padding: 8px;border-bottom: 1px solid #ddd;">${task_status}</td>
                    </tr>
                     <tr>
                        <td style="padding: 8px;"><strong>Assigned To:</strong></td>
                        <td style="padding: 8px;">${assignee_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;"><strong>Report to:</strong></td>
                        <td style="padding: 8px;">${task_reporter}</td>
                    </tr>
                </table>
            </div>

            <p style="color: red; font-weight: bold; text-align: center;">⚠️ <strong>${assignee_name}</strong>, please take immediate action on this overdue  sub task.</p>
            <p style="text-align: center;"><strong>${task_reporter}</strong>, kindly follow up on this matter.</p>

            <p>If you have any questions, please reach out immediately.</p>

        </div>
    </div>
    `,
    };

    infotransporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.log(error);

        }
        else {
            console.log("Email sent: " + info.response);
        }
    });

}