import {engine} from "express-handlebars";
import numeral from "numeral";
import hbs_sections from 'express-handlebars-sections';
//handlebar

export default function(app){
    //handlebars.
    app.engine('hbs', engine({
        defaultLayout: 'bs4.hbs', //cần phải ghi đuôi file.hbs, về sau không cần ghi .hbs
        helpers: {
            format_number(val){
                return numeral(val).format('0,0')
            },

            increase_one(val){
                return parseInt(val)+1;
            },

            decrease_one(val){
                return parseInt(val)-1;
            },
            section: hbs_sections()
        }
    }));
    app.set('view engine', 'hbs');
    app.set('views', './views');
}
