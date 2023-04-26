const ContentScheduler = require('../model/ContentScheduler')
const Activity = require('../model/ActivityContentScheduler')
const paginate = require('../helper/paginate')

exports.createContentScheduler = async (req, res) => {
    try {
        const data = { ...req.body }
        const content = await ContentScheduler.create(data)
        if (!content) {
            return res.json({ data: [], status: false, message: 'Something went wrong! Not able to create Content Scheduler!!' })
        }
        const activityData = {
            contentSchedulerId: content._id,
            addedBy: req.logInid,
            details: 'Content Scheduler Created.',
            time: content.createdAt
        }
        await Activity.create(activityData)
        return res.json({ data: [], status: true, message: 'Content Scheduler created successfully!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getContentSchedulersById = async (req, res) => {
    try {
        const checkContent = await ContentScheduler.findById(req.params.id)
        if (!checkContent) {
            return res.json({ data: [], status: false, message: "This Content Scheduler is not exist!!" })
        }
        return res.json({ data: checkContent, status: true, message: "" })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.viewActivity = async (req, res) => {
    try {
        const checkContent = await ContentScheduler.findById(req.params.id)
        if (!checkContent) {
            return res.json({ data: [], status: false, message: 'This Content Scheduler is not exist!!' })
        }
        const activityData = await Activity.find({ contentSchedulerId: req.params.id })
            .populate('addedBy', 'name')
        if (!activityData) {
            return res.json({ data: [], status: false, message: 'Something went wrong! Not able fetch data for website!!' })
        }
        return res.json({ data: activityData, status: true, message: "" })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.updateContentScheduler = async (req, res) => {
    try {
        const checkContent = await ContentScheduler.findById(req.params.id)
        if (!checkContent) {
            return res.json({ data: [], status: false, message: 'This Content Scheduler is not exist!!' })
        }
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}