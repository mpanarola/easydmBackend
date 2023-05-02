const DayBook = require('../model/DayBook')
const Activity = require('../model/ActivityDayBook')
const paginate = require('../helper/paginate')
const User = require('../model/User')
// const mongoose = require('mongoose')

exports.createDayBook = async (req, res) => {
    try {
        const dayBookData = { ...req.body }
        dayBookData.addedBy = req.logInid
        const dayBook = await DayBook.create(dayBookData)
        if (!dayBook) {
            return res.json({ data: [], status: false, message: "Something went wrong! Not able to create day book!!" })
        }
        const activityData = {
            dayBookId: dayBook._id,
            addedBy: req.logInid,
            details: 'Day Book Created.',
            time: dayBook.createdAt
        }
        await Activity.create(activityData)
        return res.json({ data: [dayBook], status: true, message: 'Day book created successfully!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.updateDayBook = async (req, res) => {
    try {
        const checkBook = await DayBook.findById(req.params.id)
        if (!checkBook) {
            return res.json({ data: [], status: false, message: "This Day Book is not exist!!" })
        }
        const dayBookData = { ...req.body }
        const updateBook = await DayBook.findByIdAndUpdate(req.params.id, dayBookData)
        if (!updateBook) {
            return res.json({ data: [], status: false, message: 'Not able to update Day Book!!' })
        }
        const updatedFields = []
        Object.keys(req.body).forEach(function (fields) {
            updatedFields.push(' ' + fields)
        });
        const activityData = {
            dayBookId: checkBook._id,
            addedBy: req.logInid,
            activityName: 'Updated',
            fields: updatedFields,
            details: 'Updated ' + updatedFields + ' Fields.',
            time: checkBook.updatedAt
        }
        await Activity.create(activityData)
        return res.json({ data: [updateBook], status: true, message: 'Day Book updated!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.deleteDayBook = async (req, res) => {
    try {
        const checkBook = await DayBook.findById(req.params.id)
        if (!checkBook) {
            return res.json({ data: [], status: false, message: "This Day Book is not exist!!" })
        }
        if (req.type === 2) {
            return res.json({ data: [], status: false, message: 'Only Admin can delete the Day Book!!' })
        }
        const deleteDayBook = await DayBook.findByIdAndRemove(req.params.id)
        if (!deleteDayBook) {
            return res.json({ data: [], status: false, message: 'Not able to update Day Book!!' })
        }
        return res.json({ data: [], status: true, message: 'Day Book deleted!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getDayBook = async (req, res) => {
    try {
        let query = [
            // {
            //     $match: {
            //         $expr: {
            //             $and: [
            //                 { $eq: ["$webpage", req.params.id] },
            //             ]
            //         }
            //     }
            // },
            {
                $lookup: {
                    from: 'User',
                    localField: 'addedBy',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$isDeleted", false] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'userData',
                }
            },
            {
                $unwind: '$userData'
            },
            {
                $lookup: {
                    from: 'Website',
                    localField: 'webpage',
                    foreignField: '_id',
                    as: 'webPageData',
                }
            },
            {
                $unwind: '$webPageData'
            }
        ]
        if (req.body && req.body.hasOwnProperty('search')) {
            if (req.body.search.dateFrom) {
                if (!req.body.search.dateTo) {
                    query.push(
                        {
                            $match: { 'creationDate': { $gte: new Date(req.body.search.dateFrom) } }
                        }
                    )
                }
                else {
                    query.push(
                        {
                            $match: {
                                $and: [
                                    { 'creationDate': { $gte: new Date(req.body.search.dateFrom) } },
                                    { 'creationDate': { $lte: new Date(req.body.search.dateTo) } }
                                ]
                            }
                        }
                    )
                }
            }
        }


        query.push(
            {
                $group:
                {
                    _id: '$userData._id',
                    totalHours: { $sum: '$hours' },
                    info: {
                        $push: {
                            "userName": "$userData.name",
                            "avatar": "$userData.avatar",
                            "dayBookId": "$_id",
                            "dayBookHour": "$hours",
                            "dayBookCreationDate": "$creationDate",
                            "dayBookDetails": "$details",
                            "webpageName": "$webPageData.webpage",
                            "webpageURL": "$webPageData.webpageUrl",
                            "webpageCategory": "$webPageData.category",
                            "webpageId": "$webPageData._id",
                        }
                    }
                }
            })
        const addPagination = await DayBook.aggregate(query)
        let totalData = addPagination.length
        let pageNo = 1, perPage = 10
        if (req.body && req.body.hasOwnProperty('pageNo') && req.body.hasOwnProperty('perPage')) {
            pageNo = req.body.pageNo
            perPage = req.body.perPage
        }
        let page = (pageNo) ? parseInt(pageNo) : 1
        let limit = (perPage) ? parseInt(perPage) : 10
        let skip = (page - 1) * limit

        let endIndex = page * limit
        if (endIndex < totalData) {
            endIndex = page * limit
        }
        else {
            endIndex = totalData
        }

        const Pagination = {
            TotalPageData: endIndex,
            PageNo: pageNo
        }
        const DayBookData = await DayBook.aggregate(query).skip(skip).limit(limit)
        return res.status(200).json({ data: [DayBookData, Pagination], status: true, message: "All user's the day book data" })

    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getDayBookOfUser = async (req, res) => {
    try {
        const checkUser = await User.findById(req.params.id)
        if (!checkUser) {
            return res.json({ data: [], status: false, message: 'This user is not exist!!' })
        }
        const option = { ...req.body };
        if (!option.hasOwnProperty('query')) {
            option['query'] = {};
        }
        option.query['addedBy'] = checkUser._id

        const dayBookOfUser = await paginate(option, DayBook);
        return res.json({ data: [dayBookOfUser], status: true, message: '' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getDayBookById = async (req, res) => {
    try {
        const checkBook = await DayBook.findById(req.params.id)
            .populate('webpage', 'webpage category')
            .populate('addedBy', 'name category')
        if (!checkBook) {
            return res.json({ data: [], status: false, message: "This Day Book is not exist!!" })
        }
        return res.json({ data: [checkBook], status: true, message: '' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.viewActivity = async (req, res) => {
    try {
        const checkBook = await DayBook.findById(req.params.id)
        if (!checkBook) {
            return res.json({ data: [], status: false, message: "This Day Book is not exist!!" })
        }
        const activityData = await Activity.find({ dayBookId: req.params.id })
            .populate('addedBy', 'name avatar')
            .sort({ createdAt: -1 })
        if (!activityData) {
            return res.json({ data: [], status: false, message: 'Not able to fetch data for this Day Book!!' })
        }
        return res.json({ data: [activityData], status: true, message: '' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}