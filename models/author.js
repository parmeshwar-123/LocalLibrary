const mongoose = require('mongoose');
const { DateTime } = require("luxon");
const Schema = mongoose.Schema;
const AuthorSchema  = new Schema({
    first_name: {type: String, required:true, maxLength: 100},
    last_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date}
});

AuthorSchema.virtual("name").get(function() {
    let fullname = "";

    if(this.first_name && this.last_name) {
        fullname = `${this.first_name} ${this.last_name}`;
    }

    return fullname;
});

AuthorSchema.virtual("url").get(function() {
    return  `/catalog/author/${this._id}`;
});

AuthorSchema.virtual("formated_date_of_birth").get(function() {
    return DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
});

AuthorSchema.virtual("formated_date_of_death").get(function() {
    return this.date_of_death ?  DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : "";
});

module.exports = mongoose.model("Author", AuthorSchema);