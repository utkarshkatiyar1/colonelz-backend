import projectModel from "../../../models/adminModels/project.model.js";
import projectExecutionModel from "../../../models/adminModels/project_execution_model.js";
import orgModel from "../../../models/orgmodels/org.model.js";
import { responseData } from "../../../utils/respounse.js";
import puppeteer from 'puppeteer';



function generateSixDigitNumber() {
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
}
export const projectExecutionTask = async (req, res) => {
    try {
        const { project_id, org_id, task_name, start_date, end_date, color } = req.body;
        if (!project_id) {
            responseData(res, "", 400, false, "Project ID is required");
        }
        else if (!org_id) {
            responseData(res, "", 400, false, "Organization ID is required");
        }
        else if (!task_name) {
            responseData(res, "", 400, false, "Task name is required");

        }
        else if (!start_date) {
            responseData(res, "", 400, false, "Start date is required");

        }
        else if (!end_date) {
            responseData(res, "", 400, false, "End date is required");

        }
        else {
            const task_id = `TK-${generateSixDigitNumber()}`;
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                return responseData(res, "", 404, false, "Organization not found");
            }
            const find_project = await projectModel.findOne({ project_id: project_id, org_id: org_id });
            if (!find_project) {
                return responseData(res, "", 404, false, "Project not found");
            }
            const projectExecutionData = await projectExecutionModel.create({
                project_id: project_id,
                org_id: org_id,
                task_name: task_name,
                task_id: task_id,
                start_date: start_date,
                end_date: end_date,
                color: color,
            });
            responseData(res, "Project execution task created successfully", 200, true, "", []);

        }

    } catch (error) {
        console.error("Error creating project execution task:", error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

export const getProjectExecutionTask = async (req, res) => {
    try {
        const { project_id, org_id } = req.query;
        if (!project_id) {
            return responseData(res, "", 400, false, "Project ID is required");
        }
        else if (!org_id) {
            return responseData(res, "", 400, false, "Organization ID is required");
        }
        else {
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                return responseData(res, "", 404, false, "Org not found");
            }
            const find_project = await projectModel.findOne({ project_id: project_id, org_id: org_id });
            if (!find_project) {
                return responseData(res, "", 404, false, "Project not found");
            }
            const find_project_execution_task = await projectExecutionModel.find({ project_id: project_id, org_id: org_id });
            if (find_project_execution_task.length > 0) {
                return responseData(res, "Project execution task found", 200, true, "", find_project_execution_task);
            } else {
                return responseData(res, "No project execution task found for this project", 200, true, "");
            }

        }

    } catch (error) {
        console.error("Error fetching project execution task:", error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}

export const updateProjectExecutionTask = async (req, res) => {
    try {
        const {
            project_id,
            org_id,
            task_id,
            task_name,
            start_date,
            end_date,
            color,


            details_start_date,
            details_end_date,
            comment,
            type
        } = req.body;

        if (!project_id || !org_id || !task_id || !task_name || !start_date || !end_date) {
            return responseData(res, "", 400, false, "All required fields must be provided");
        }

        const check_org = await orgModel.findOne({ _id: org_id });
        if (!check_org) return responseData(res, "", 404, false, "Org not found");

        const find_project = await projectModel.findOne({ project_id, org_id });
        if (!find_project) return responseData(res, "", 404, false, "Project not found");

        const updateQuery = {
            $set: {
                task_name,
                start_date,
                end_date,
                color
            }
        };

        // Conditionally push task_details at 0th position if all fields are present
        if (details_start_date && details_end_date && comment && type) {
            const d_id = `DTK-${generateSixDigitNumber()}`;
            updateQuery.$push = {
                task_details: {
                    $each: [{
                        details_id: d_id,
                        type,
                        details_start_date,
                        details_end_date,
                        comment
                    }],
                    $position: 0
                }
            };
        }

        const update_task = await projectExecutionModel.updateOne({ task_id }, updateQuery);

        if (update_task.modifiedCount > 0) {
            return responseData(res, "Project execution task updated successfully", 200, true, "", []);
        } else {
            return responseData(res, "", 404, false, "Task not updated");
        }

    } catch (error) {
        console.error("Error updating project execution task:", error);
        return responseData(res, "", 500, false, "Internal server error");
    }
};


export const deleteProjectExecutionTask = async (req, res) => {
    try {
        const { org_id, project_id, task_id } = req.body;
        if (!project_id) {
            return responseData(res, "", 400, false, "Project ID is required");
        }
        else if (!org_id) {

            return responseData(res, "", 400, false, "Org ID is required");
        }
        else if (!task_id) {

            return responseData(res, "", 400, false, "Task ID is required");
        }
        else {
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                return responseData(res, "", 404, false, "Org not found");
            }

            const project = await projectModel.findOne({ org_id: org_id, project_id: project_id });
            if (!project) {
                return responseData(res, "", 404, false, "Project not found");
            }
            else {
                const task = await projectExecutionModel.findOne({
                    org_id: org_id, project_id: project_id
                    , task_id: task_id
                });
                if (!task) {
                    return responseData(res, "", 404, false, "Task not found");
                }
                else {
                    const delete_task = await projectExecutionModel.deleteOne(
                        {
                            org_id: org_id,
                            project_id: project_id,
                            task_id: task_id
                        }
                    );
                    if (delete_task.modifiedCount === 0) {
                        return responseData(res, "", 404, false, "Task not found or already deleted");
                    }
                    else {
                        return responseData(res, "Task deleted successfully", 200, true, "", []);
                    }
                }
            }

        }
    }
    catch (error) {
        console.error("Error deleting project execution task:", error);
        return responseData(res, "", 500, false, "Internal server error");
    }
}


export const deleteProjectExecutionTaskDetails = async (req, res) => {
    try {
        const { org_id, project_id, task_id, details_id } = req.body;
        if (!project_id) {
            return responseData(res, "", 400, false, "Project ID is required");
        }
        else if (!org_id) {

            return responseData(res, "", 400, false, "Org ID is required");
        }
        else if (!task_id) {

            return responseData(res, "", 400, false, "Task ID is required");
        }
        else if (!details_id) {

            return responseData(res, "", 400, false, "Details ID is required");
        }
        else {
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                return responseData(res, "", 404, false, "Org not found");
            }

            const project = await projectModel.findOne({ org_id: org_id, project_id: project_id });
            if (!project) {
                return responseData(res, "", 404, false, "Project not found");
            }
            else {
                const task = await projectExecutionModel.findOne({
                    org_id: org_id, project_id: project_id
                    , task_id: task_id
                });
                if (!task) {
                    return responseData(res, "", 404, false, "Task not found");
                }
                else {
                    const update_task = await projectExecutionModel.updateOne(
                        {
                            org_id: org_id,
                            project_id: project_id,
                            task_id: task_id
                        },
                        {
                            $pull: { task_details: { details_id: details_id } }
                        }
                    );
                    if (update_task.modifiedCount === 0) {
                        return responseData(res, "", 404, false, "Task details not found or already deleted");
                    }
                    else {
                        return responseData(res, "Task details deleted successfully", 200, true, "", []);
                    }
                }

            }
        }

    }
    catch (error) {
        console.error("Error deleting project execution task details:", error);
        return responseData(res, "", 500, false, "Internal server error");
    }
}

export const updateProjectExecutionTaskDetails = async (req, res) => {
    try {
        const { org_id, project_id, task_id, details_id, details_start_date, details_end_date, comment, type } = req.body;
        if (!project_id) {
            return responseData(res, "", 400, false, "Project ID is required");
        }
        else if (!org_id) {

            return responseData(res, "", 400, false, "Org ID is required");
        }
        else if (!task_id) {

            return responseData(res, "", 400, false, "Task ID is required");
        }
        else if (!details_id) {
            return responseData(res, "", 400, false, "Details ID is required");

        }
        else {
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                return responseData(res, "", 404, false, "Org not found");

            }

            const project = await projectModel.findOne({ org_id: org_id, project_id: project_id });
            if (!project) {
                return responseData(res, "", 404, false, "Project not found");
            }
            else {
                const task = await projectExecutionModel.findOne({
                    org_id: org_id, project_id: project_id
                    , task_id: task_id
                });
                if (!task) {
                    return responseData(res, "", 404, false, "Task not found");
                }
                else {
                    const update_task = await projectExecutionModel.updateOne(
                        {
                            org_id: org_id,
                            project_id: project_id,
                            task_id: task_id,
                            "task_details.details_id": details_id
                        },
                        {
                            $set: {
                                "task_details.$.delay_start_date": details_start_date,
                                "task_details.$.delay_end_date": details_end_date,
                                "task_details.$.comment": comment,
                                "task_details.$.type": type
                            }
                        }
                    );
                    if (update_task.modifiedCount > 0) {
                        return responseData(res, "Project execution task updated successfully", 200, true, "", []);
                    } else {
                        return responseData(res, "", 404, false, "No project execution task found for this project");
                    }
                }

            }
        }
    }
    catch (error) {
        console.error("Error updating project execution task details:", error);
        return responseData(res, "", 500, false, "Internal server error");
    }
}


export const downloadExecutionChart = async (req, res) => {
    try {

        const chartData = req.body; // contains your execData etc.

        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        // Render HTML with your Gantt chart using React (SSR or static HTML)
        await page.setContent(`
            <html>
            <head>
                <style>
                body { margin: 0; padding: 20px; background: #f9fafb; }
                </style>
                <!-- You may also include Tailwind CDN here if your styles are not inline -->
            </head>
            <body>
                <div id="chart-root"></div>
                <script>
                window.chartData = ${JSON.stringify(chartData)};
                </script>
                <script src="http://localhost:3000/gantt-static-bundle.js"></script>
            </body>
            </html>
        `, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A2',
            printBackground: true,
            landscape: true,
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="gantt-chart.pdf"',
        });
        res.send(pdfBuffer);

    }
    catch (error) {
        console.error("Error Downloading project execution chart:", error);
        return responseData(res, "", 500, false, "Internal server error");
    }
}

