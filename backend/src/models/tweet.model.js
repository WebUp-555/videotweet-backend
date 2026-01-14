import mongoose,{Schema} from "mongoose";
const tweetSchema=new Schema ({

    content:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    likes:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    isLiked:{
        type:Boolean,
        default:false
    }

},{timestamps:true})

export const Tweet = mongoose.model("Tweet",tweetSchema)