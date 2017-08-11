module.exports = {
    getOrdersUrl: (storeNumber) => {
       return  
       `https://9rjbuh16l0.execute-api.us-east-1.amazonaws.com/prod/distro/shipping/${storeNumber}`;
   }
}