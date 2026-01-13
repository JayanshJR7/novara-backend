import mongoose from "mongoose";

const SilverPriceSchema = new mongoose.Schema({
    //current price of silver per gram in rupees
    pricePerGram:{
        type:Number,
        required:[true , 'Please provide the silver price per gram'],
        min:0,
    },

    lastUpdated:{
        type:Date,
        default:Date.now,
    },

    source:{
        type:String,
        enum: ['manual', 'goldapi-auto', 'goldapi-manual', 'api', 'scraper'],
        default:'manual'
    },

    currency:{
        type:String,
        default:'INR'
    }

},{
    timestamps:true,
})

SilverPriceSchema.statics.getLatestPrice = async function(){
    //find the most recently updated price
    const latestPrice = await this.findOne().sort({lastUpdated: -1});

    //if no price exists then create and return default price
    if(!latestPrice){
        const defaultPrice = await this.create({
            pricePerGram: 152,
            source: 'manual',
            lastUpdated: new Date()
        });
        return defaultPrice;
    }

    return latestPrice;
}


const SilverPrice = mongoose.model('SilverPrice', SilverPriceSchema);
export default SilverPrice;