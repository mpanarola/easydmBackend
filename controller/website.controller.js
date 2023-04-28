const Website = require('../model/Website')
const Activity = require('../model/ActivityWebsite')
const paginate = require('../helper/paginate')

exports.createWebsite = async (req, res) => {
    try {
        const data = { ...req.body }
        data.addedBy = req.logInid
        const website = new Website(data)
        const checkData = await website.save()
        if (!checkData) {
            return res.json({ data: [], status: false, message: 'Something went wrong! Not able to add website!!' })
        }
        const activityData = {
            webpageId: checkData._id,
            addedBy: req.logInid,
            details: 'Website ' + checkData.webpage + ' Created.',
            time: checkData.createdAt
        }
        await Activity.create(activityData)
        return res.json({ data: [checkData], status: true, message: 'Website created successfully!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.viewActivity = async (req, res) => {
    try {
        const checkWebsite = await Website.findById(req.params.id)
        if (!checkWebsite) {
            return res.json({ data: [], status: false, message: 'This website is not exist!!' })
        }
        const activityData = await Activity.find({ webpageId: req.params.id })
            .populate('addedBy', 'name avatar')
            .populate('webpageId', 'webpage')
            .sort({ createdAt: -1 })
        if (!activityData) {
            return res.json({ data: [], status: false, message: 'Something went wrong! Not able fetch data for website!!' })
        }
        return res.json({ data: [activityData], status: true, message: "" })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getWebsiteById = async (req, res) => {
    try {
        const checkWebsite = await Website.findById(req.params.id)
            .populate('addedBy', 'name')
            .populate('assignedTo', 'name')
        if (!checkWebsite) {
            return res.json({ data: [], status: false, message: 'This website is not available!!' })
        }
        return res.json({ data: [checkWebsite], status: true, message: "" })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.updateWebsite = async (req, res) => {
    try {
        const checkWebsite = await Website.findById(req.params.id)
        if (!checkWebsite) {
            return res.json({ data: [], status: false, message: 'This website is not available!!' })
        }
        const websiteData = { ...req.body }
        const checkUpdate = await Website.findByIdAndUpdate(req.params.id, websiteData)
        if (!checkUpdate) {
            return res.json({ data: [], status: false, message: 'Not able to update website!!' })
        }
        const updatedFields = []
        Object.keys(req.body).forEach(function (fields) {
            updatedFields.push(fields)
        });
        console.log('Data ==>', updatedFields)
        const activityData = {
            webpageId: checkWebsite._id,
            addedBy: req.logInid,
            activityName: 'Updated',
            fields: updatedFields,
            details: 'Updated ' + updatedFields + ' Fields.',
            time: checkUpdate.updatedAt
        }
        await Activity.create(activityData)
        return res.json({ data: [checkUpdate], status: true, message: 'Website updated!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.deleteWebsite = async (req, res) => {
    try {
        const checkWebsite = await Website.findById(req.params.id)
        if (!checkWebsite) {
            return res.json({ data: [], status: false, message: 'This website is not available!!' })
        }
        if (req.type === 2) {
            return res.json({ data: [], status: false, message: 'Only Admin can delete the website!!' })
        }
        const deleteWebsite = await Website.findByIdAndRemove(req.params.id)
        if (!deleteWebsite) {
            return res.json({ data: [], status: false, message: 'Not able to update website!!' })
        }
        return res.json({ data: [], status: true, message: 'Website deleted!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getWebsites = async (req, res, next) => {
    try {
        const option = { ...req.body };
        if (!option.hasOwnProperty('query')) {
            option['query'] = {};
        }
        option.query['isDeleted'] = false

        const websites = await paginate(option, Website);
        return res.json({ data: [websites], status: false, message: "All the websites" });
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}