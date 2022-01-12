import {engine} from "express-handlebars";
import numeral from "numeral";
import moment from 'moment'; //format date.
import hbs_sections from 'express-handlebars-sections';

//handlebar

export default function(app){
    //handlebars.
    app.engine('hbs', engine({
        defaultLayout: 'bs4.hbs', //cần phải ghi đuôi file.hbs, về sau không cần ghi .hbs
        helpers: {
            format_number(val) {
                return numeral(val).format('0,0')
            },

            increase_one(val) {
                return parseInt(val) + 1;
            },

            decrease_one(val) {
                return parseInt(val) - 1;
            },
            section: hbs_sections(),

            ifCond(v1, v2, options) {
                if (v1 === v2) {
                    return options.fn(this);
                }
                return options.inverse(this);
            },

            formatDate(val) {
                return moment(val).utcOffset('+0700').format('DD/MM/YYYY')
            },
            formatDateProfile(val) {
                return moment(val).utcOffset('+0700').format('YYYY-MM-DD')
            },
            formatDateTime(val) {
                return moment(val).utcOffset('+0700').format('DD/MM/YYYY HH:mm:ss')
            },
            formatDateCountdown(val) {
                return moment(val).utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss')
            },
            MaskCharacter(str) {
                if (str === 'None'){
                    return str;
                }
                var tmp = str;
                var result = tmp.slice(4, str.length)
                return "####"+result
            },
            // Khang
            format_date(date){
                var d = new Date(date);
                return moment(d).format("DD/MM/YYYY HH:mm:ss");
            },
            roundPercentage(val){
                return Math.round(val);
            }
            // Khang
        }
    }));
    app.set('view engine', 'hbs');
    app.set('views', './views');
}
