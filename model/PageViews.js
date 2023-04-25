const mongoose = require('mongoose');
const { PAGINATE_OPTIONS } = require('../util/pagination.constant');
const mongoosePaginate = require('mongoose-paginate-v2');

const PageViewsSchema = new mongoose.Schema({
    webpage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website',
        require: true
    },
    publishedOn: {
        type: Date,
        require: true
    },
    monthYear: {
        type: Date,
        require: true
    },
    numberOfPageviews: {
        type: Number,
        require: true
    }
}, {
    timestamps: true
})

mongoosePaginate.paginate.options = PAGINATE_OPTIONS;
PageViewsSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('PageViews', PageViewsSchema, 'PageViews')