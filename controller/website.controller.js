const Website = require('../model/Website')
const Activity = require('../model/ActivityWebsite')
const paginate = require('../helper/paginate')
const moment = require('moment')
const PageViews = require('../model/PageViews')

exports.createWebsite = async (req, res) => {
    try {
        const data = { ...req.body }
        const oldData = await Website.findOne({ webpage: data.webpage })
        if (oldData) {
            return res.json({ data: [], status: false, message: "Website already created with same name!!" })
        }
        data.addedBy = req.logInid
        const checkData = await Website.create(data)
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
        return res.json({ data: [activityData], status: true, message: "All the activity data." })
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
        return res.json({ data: [checkWebsite], status: true, message: "Particular website's data." })
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
        if (Object.keys(websiteData).length === 0) {
            return res.json({ data: [], status: true, message: "Cannot update empty object!!" })
        }
        const updatedFields = [], updatedValues = []
        let fieldList = ['-_id']
        Object.keys(req.body).forEach(function (fields) {
            fieldList.push(fields)
            updatedFields.push(' ' + fields)
        })
        Object.values(req.body).forEach(function (value) {
            updatedValues.push(value)
        })
        let oldWebsiteData = await Website.findById(req.params.id).select(fieldList)
        let old = oldWebsiteData
        if (req.body.hasOwnProperty('assignedTo')) {
            oldWebsiteData = await Website.findById(req.params.id).select(fieldList)
                .populate('assignedTo', 'name email userRole userType')

            old = { ...oldWebsiteData }
            old._doc.assigne = []
            oldWebsiteData.assignedTo.forEach(element => {
                old._doc.assigne.push(element.name)
            });
        }
        const checkUpdate = await Website.findByIdAndUpdate(req.params.id, websiteData)
        if (!checkUpdate) {
            return res.json({ data: [], status: false, message: 'Not able to update website!!' })
        }
        let updatedData = await Website.findById(req.params.id).select(fieldList)
        let newData = updatedData
        if (req.body.hasOwnProperty('assignedTo')) {
            updatedData = await Website.findById(req.params.id).select(fieldList)
                .populate('assignedTo', 'name email userRole userType')

            newData = { ...updatedData }
            newData._doc.assigne = []
            updatedData.assignedTo.forEach(element => {
                newData._doc.assigne.push(element.name)
            });
        }

        const activityData = {
            webpageId: checkWebsite._id,
            addedBy: req.logInid,
            activityName: 'Updated',
            oldData: old,
            newData: newData,
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
        return res.json({ data: [websites], status: true, message: "Data Listed Successfully" });
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.dashboard = async (req, res, next) => {
    try {
        var lastMonth = moment().subtract(3, 'month').startOf('month').format('YYYY-MM-DD hh:mm')
        var latestMonth = moment().startOf('month').format('YYYY-MM-DD hh:mm')
        // const mostViewedWebpages = await PageViews.find({ monthYear: { $lte: latestMonth, $gt: lastMonth } })
        //     .populate('webpage', 'webpage webpageUrl category assignedBy')
        //     .sort({ numberOfPageviews: -1 })

        let query = [
            {
                $lookup: {
                    from: 'Website',
                    localField: 'webpage',
                    foreignField: '_id',
                    as: 'webpageData',
                }
            },
            {
                $unwind: '$webpageData'
            },
            // {
            //     $match: {
            //         $and: [
            //             { 'monthYear': { $gt: lastMonth } },
            //             { 'monthYear': { $lte: latestMonth } }
            //         ]
            //     }
            // },
            {
                $group:
                {
                    _id: '$webpage',
                    totalViews: { $sum: '$numberOfPageviews' },
                    info: {
                        $push: {
                            "userName": "$webPageData.assignedBy",
                            "webpageName": "$webPageData.webpage",
                            "webpageURL": "$webPageData.webpageUrl",
                            "webpage": "$webpage",
                            "publishedOn": "$publishedOn",
                            "monthYear": "$monthYear",
                            "numberOfPageviews": "$numberOfPageviews",
                            "readability": "$readability",
                            "seo": "$seo",
                            "toneOfVoice": "$toneOfVoice",
                            "originality": "$originality",
                            "contentScore": "$contentScore"
                        }
                    }
                }
            }
            , { $sort: { totalViews: -1 } }
        ]

        const mostViewedWebpages = await PageViews.aggregate(query)
        // for (let i = 1; i <= 12; i++) {
        //     let nextMonth = moment(dateFrom).add(i, 'months')
        //     lastMOnth = moment(nextMonth).subtract(1, 'months')
        //     const month = moment(lastMOnth).format('MMM')
        //     const year = moment(lastMOnth).format('YYYY');
        //     const betweenDate = { $lte: nextMonth, $gt: lastMOnth }
        //     const monthWise = await PageView.find({ $and: [{ isDeleted: false }, { monthYear: betweenDate }, { webpage: req.params.id }] })
        //     let count = 0
        //     monthWise.forEach(element => {
        //         count = count + element.numberOfPageviews
        //     });
        //     monthYear.push(`${month} - ${year}`)
        //     data.push(count)
        // }

        return res.json({ data: { data: mostViewedWebpages }, status: true, message: "Last 3 Month's Data." })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}