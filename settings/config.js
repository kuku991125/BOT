require("dotenv").config();

module.exports = {
    TOKEN: "",  // your bot token
    EMBED_COLOR: "#000001", //<= default is "#000001"
    OWNER_ID: "960484216095776788", //您的主人不和諧ID示例e: "515490955801919488"
    DEV_ID: [], // 如果您只想使用命令bot，則可以在此處放置ID示例: ["123456789", "123456789"]
    MONGO_URI: "mongodb+srv://terminus_dragon:E1qNgDHlMVRfAJSS@cluster0.v2fylwq.mongodb.net/?retryWrites=true&w=majority", // your mongo uri
}
