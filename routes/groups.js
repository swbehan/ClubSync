import { Router } from "express";
import groupsCollection from "../db/groups-db.js";
import { isAuthenticated, requireRole } from "../middleware/auth.js";

const groupsRouter = Router();

groupsRouter.get("/", requireRole("treasurer" ), async (req, res) => {
    try { 
        const groups = await groupsCollection.getAllGroups();
        res.json(groups);
    } catch(error) { 
        console.error("Error fetching groups", error);
        res.status(500).json({message: "Internal Server Error"})
    }
});

groupsRouter.post("/", requireRole("treasurer"), async (req, res) => { 
    try { 
        const { name } = req.body;
        if (!name) { 
            return res.status(400).json({ message: 'Group name is required '});
        }
        const result = await groupsCollection.createGroup({ name, createdBy: req.user._id});
        res.status(201).json(result);

    } catch(error) { 
        console.error("Error creating groups", error);
        res.status(500).json({message: "Internal Server Error"});

    }

});

groupsRouter.get("/active", isAuthenticated, async (req, res) => {
    try {
        const group = await groupsCollection.findActiveGroup();
        if (!group) {
            return res.status(404).json({ message: "No active group" });
        }
        res.json(group);
    } catch (error) {
        console.error("Error fetching active group", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

groupsRouter.get("/:id", isAuthenticated, async (req, res) => {
    try {
        const group = await groupsCollection.findGroupById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        res.json(group);
    } catch (error) {
        console.error("Error fetching group", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

groupsRouter.put("/:id", requireRole("treasurer"), async (req, res) => {
    try {
        const { name, active } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (active !== undefined) updates.active = active;
        const updated = await groupsCollection.updateGroup(req.params.id, updates);
        if (!updated) {
            return res.status(404).json({ message: "Group not found" });
        }
        res.json(updated);
    } catch (error) {
        console.error("Error updating group", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default groupsRouter;




