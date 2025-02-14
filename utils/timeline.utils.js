import TimelineModel from "../models/adminModels/timeline.model.js"; 
import { responseData } from "./respounse.js";

export const createOrUpdateTimeline = async (leadId, projectId, org_id, leadUpdate, projectUpdate, res) => {
    try {
  
      let timeline;
  
      // Case 1: Only lead_id is given
      if (leadId && !projectId) {
        timeline = await TimelineModel.findOne({ lead_id: leadId, project_id: ""});
        if (!timeline) {
          // Create a new document if not found
          timeline = new TimelineModel({
            org_id: org_id,
            lead_id: leadId,
            project_id: '',
            leadEvents: [leadUpdate],
          });
        } else {
          // Add the event to leadEvents if document exists
          timeline.leadEvents.push(leadUpdate);
        }
      }
  
      // Case 2: Both lead_id and project_id are given
      else if (leadId && projectId) {
        timeline = await TimelineModel.findOne({ lead_id: leadId, project_id: '' });

        if(timeline) {
            // Store project_id if it's not already set
            if (!timeline.project_id) {
            timeline.project_id = projectId;
            }
            // Add the event to projectEvents
            timeline.projectEvents.push(projectUpdate);
        } else {
            timeline = []
            timeline = await TimelineModel.findOne({ lead_id: leadId, project_id: projectId});

            if(timeline) {
                if (!timeline.project_id) {
                    timeline.project_id = projectId;
                }

                if(projectUpdate) {
                    // Add the event to projectEvents
                    timeline.projectEvents.push(projectUpdate);
                }

                if(leadUpdate) {
                    // Add the event to projectEvents
                    timeline.leadEvents.push(leadUpdate);
                }

              
            } else {
                timeline = new TimelineModel({
                    lead_id: leadId,
                    project_id: projectId,
                    leadEvents: [leadUpdate],
                    projectEvents: [projectUpdate],
                });
            }
        }
      }
  
      // Case 3: Only project_id is given
      else if (projectId && !leadId) {
        timeline = await TimelineModel.findOne({ project_id: projectId });
        // Add the event to projectEvents if document exists

        if(timeline) {
            timeline.projectEvents.push(projectUpdate);
        } else {

            leadUpdate = {
                username: "Unknown",
                role: "Unknown",
                message: ` has created the lead .`,
                updated_date: new Date(),
                tags: [],
                type: 'lead updation'
      
              }


            timeline = new TimelineModel({
                lead_id: leadId,
                project_id: projectId,
                leadEvents: [leadUpdate],
                projectEvents: [projectUpdate],
            });
        }
      }
  
      // Save the timeline document
      await timeline.save();
      
    } catch (error) {
      console.log("createor update error", error)
      throw new Error("Internal server Error", error);

    }
  };