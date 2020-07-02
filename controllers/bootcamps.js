// @desc  GET all bootca,ps 
// @route GET /api/bootcamps
// @access  Public

exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Show all bootcamps' })
}

// GET id
exports.getBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Show bootcamp ${req.params.id }`})
}

// Create
exports.createBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Create a mew bootcamps' })
}

// Update
exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Update bootcamp ${req.params.id }`})
}

// Delete
exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Successfully deleted ${req.params.id}` })
}