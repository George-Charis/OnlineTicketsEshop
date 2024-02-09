const Image = require ("../model/Image");

//function to store the images in the database
const storeImages = async (localImages, name) => {
  const files = localImages;
  let imageUrls = [];

  try {
    await Promise.all(files.map(async (file) => {
      const fileData = {
        associated_event: name,
        name: file.originalname,
        data: file.buffer,
      };
      //check if the image exists if not store and create url
      const foundImage = await Image.findOne({ associated_event: fileData.associated_event, name: fileData.name }).exec();
      if (!foundImage) {
        await Image.create(fileData);
        imageUrls.push(`${process.env.API_URI}images/${name}/${fileData.name}`);
      }
    }));

    console.log(imageUrls);
    //return the generated image urls
    return imageUrls;

  } catch (err) {
    console.log(err);
  }
};


const getImagesByEvent = async (req, res) => {
  const { eventName, imageName } = req.params;

  if (!eventName || !imageName) {
    return res.status(400).json({ 'message': 'Event\'s name and image\'s name are required.' });
  }

  try {
    const findImagesByEvent = await Image.findOne({ associated_event: eventName, name: imageName }).exec();

    if (!findImagesByEvent) {
      return res.status(404).json({ 'message': 'No image found' });
    }

    // Set headers only once before writing the image data
    res.writeHead(200, {
      'Content-Type': 'image/jpeg', // Adjust content type based on your image type
    });

    // Write the image data to the response
    res.write(findImagesByEvent.data);

    res.end(); // End the response after writing the image data
  } catch (err) {
    console.error(`Error serving image for ${eventName}:`, err);
    res.status(500).json({ 'message': 'Internal Server Error' });
  }
};

module.exports = {
    storeImages,
    getImagesByEvent
}