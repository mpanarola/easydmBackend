const mongoose = require('mongoose');
const { PAGINATE_OPTIONS } = require('../util/pagination.constant');
const mongoosePaginate = require('mongoose-paginate-v2');

const ContentSchedulerSchema = new mongoose.Schema({
    contentType: {
        type: String,
        require: true,
        enum: ["Article", "Blog", "eBook", "PPT", "Infographics"]
    },
    webpage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website'
    },
    refereceLinks: [String],
    topicTitle: {
        type: String,
    },
    docLink: String,
    expectedWords: String,
    actualWords: String,
    assignedOn: {
        type: Date,
        require: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    submitedOn: {
        type: Date,
        require: true
    },
    writtenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    contentStatus: {
        type: String,
        require: true,
        enum: ["In-progress", "Input-missing", "Complete", "In-review"],
        // default: "In-progress"
    },
}, {
    timestamps: true
})

mongoosePaginate.paginate.options = PAGINATE_OPTIONS;
ContentSchedulerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('ContentScheduler', ContentSchedulerSchema, 'ContentScheduler')