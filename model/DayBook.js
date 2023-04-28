const mongoose = require('mongoose');
const { PAGINATE_OPTIONS } = require('../util/pagination.constant');
const mongoosePaginate = require('mongoose-paginate-v2');

const DayBookSchema = new mongoose.Schema({
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    webpage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website',
        require: true
    },
    creationDate: {
        type: Date,
        default: new Date()
    },
    hours: {
        type: Number,
        require: true
    },
    details: {
        type: String,
        require: true
    }
}, {
    timestamps: true
})

mongoosePaginate.paginate.options = PAGINATE_OPTIONS;
DayBookSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('DayBook', DayBookSchema, 'DayBook')