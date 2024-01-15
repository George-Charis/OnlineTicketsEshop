const Image = require ("../model/Image");

const storeImages = async (localImages, name, res) => {

    const files = localImages;
    console.log(files);

    try {
      const filePromises = Object.keys(files).map(async (key) => {
        console.log(files[key]);
        const fileData = {
          associated_event: name,
          name: files[key].name,
          data: files[key].data,
        };
        console.log(fileData);
        // Save the file to MongoDB
        await Image.create(fileData);
      });

      const uploadedFiles = await Promise.all(filePromises);

      return uploadedFiles;
    } catch (err) {
      console.error('Error saving files to MongoDB:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
}

const getImagesByEvent = async (req, res) => {
    if(!req?.params?.eventName) 
        return res.status(400).json({ 'message': 'Event\'s name required.' });

    const findImagesByEvent = await Image.find({ associated_event: req.params.eventName }).exec();
    if(!findImagesByEvent.length) return res.status(404).json({ 'message': 'No images found' });

    try{
        findImagesByEvent.forEach( (image) => {
            const decodedImage = Buffer.from(findImagesByEvent.image, 'base64');
            res.end(decodedImage);
        });
    }catch(err){
        console.error(`Error serving image ${req.params.imageId}:`, err);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
}

module.exports = {
    storeImages,
    getImagesByEvent
}