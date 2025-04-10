import moment from "moment";

export const momentTH = () => {
    moment.locale("th"); 

    const oldFormat = moment.prototype.format
    moment.prototype.format = function (format) {
        const result = format?.replace('YYYY', this._d.getFullYear()+543)
        if(format)
        
        return oldFormat.bind(this)(result)
    }
    moment.prototype.year = function (input) {
        const yearBias = 543
        const annoYear = this._d.getFullYear()
        const bdyear = annoYear + yearBias
        if (!input) return bdyear
    
        const diff = -(bdyear - input)
        
        return this.add(diff, 'year')
    }
}

export const momentEN = () => {
    moment.locale("en"); 

    const oldFormat = moment.prototype.format
    moment.prototype.format = function (format) {
        const result = format?.replace('YYYY', this._d.getFullYear())
        if(format)
        
        return oldFormat.bind(this)(result)
    }
    moment.prototype.year = function (input) {
        const yearBias = 0
        const annoYear = this._d.getFullYear()
        const bdyear = annoYear + yearBias
        if (!input) return bdyear
    
        const diff = -(bdyear - input)
        
        return this.add(diff, 'year')
    }
}

//Example
//useEffect(() => {
//     momentTH();
//     return () => { 
//         momentEN();
//     }
// }, [])