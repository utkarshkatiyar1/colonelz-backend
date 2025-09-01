import TimelineModel from "../models/adminModels/timeline.model.js"; 
import { responseData } from "./respounse.js";

export const createOrUpdateTimeline = async (leadId, projectId, org_id, leadUpdate, projectUpdate, res) => {
    try {
  
      let timeline;
  
      // Case 1: Only lead_id is given
      if (leadId && !projectId) {
        if(leadUpdate.type == "lead activation") {
            timeline = new TimelineModel({
                org_id: org_id,
                lead_id: leadId,
                project_id: '',
                leadEvents: [leadUpdate],
            });
            timeline.save();
            return;
        }

        timeline = await TimelineModel.findOne({ lead_id: leadId});
        if (!timeline) {
          // Create a new document if not found
          timeline = new TimelineModel({
            org_id: org_id,
            lead_id: leadId,
            project_id: '',
            leadEvents: [leadUpdate],
          });

          timeline.save();
        } else {
          timeline = await TimelineModel.find({ lead_id: leadId});
          // Add the event to leadEvents if document exists
          for (let tl of timeline) {
            // Step 2: Push leadUpdate to all timelines
            tl.leadEvents.push(leadUpdate);
      
            // Step 4: Save the updated timeline
            await tl.save();
          }

        //   timeline.save();
        }
      }
  
      // Case 2: Both lead_id and project_id are given
      else if (leadId && projectId) {
        timeline = await TimelineModel.find({ lead_id: leadId});

        if(timeline) {

            for (let tl of timeline) {
                // Step 2: Push leadUpdate to all timelines
                if(leadUpdate) {
                    tl.leadEvents.push(leadUpdate);
                }
          
                // Step 3: If the project_id matches, also push the projectUpdate
                if (tl.project_id === "") {
                    tl.project_id = projectId;

                    if(projectUpdate) {
                        tl.projectEvents.push(projectUpdate);
                    }
                }
          
                // Step 4: Save the updated timeline
                await tl.save();
            }

            // Store project_id if it's not already set
            // if (!timeline.project_id) {
            // timeline.project_id = projectId;
            // }
            // // Add the event to projectEvents
            // timeline.projectEvents.push(projectUpdate);
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

                timeline.save();

              
            } else {
                timeline = new TimelineModel({
                    lead_id: leadId,
                    project_id: projectId,
                    leadEvents: [leadUpdate],
                    projectEvents: [projectUpdate],
                });

                timeline.save();
            }
        }
      }
  
      // Case 3: Only project_id is given
      else if (projectId && !leadId) {
        timeline = await TimelineModel.findOne({ project_id: projectId });
        // Add the event to projectEvents if document exists

        if(timeline) {
            timeline.projectEvents.push(projectUpdate);
            timeline.save();
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
            timeline.save();
        }
      }
  
      // Save the timeline document
    //   await timeline.save();
      
    } catch (error) {
      console.log("createOrUpdateTimeline error:", error);
      // Don't throw error, just log it to prevent breaking the main flow
      console.error("Timeline creation failed but continuing with main operation");
    }
  };