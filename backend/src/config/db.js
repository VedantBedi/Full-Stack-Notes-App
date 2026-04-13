import mongoose from 'mongoose'

export const connectdb = async (URL) => {
    try{
        await mongoose.connect(URL);
        console.log("mongodb connnected succesfully");
    } catch (error) {
        console.log("error connecting to mongoose", error);
        process.exit(1);
    }
}
