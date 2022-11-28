import SearchResult from '../models/SearchResult.js'

export const getSearchResult = async (req, res, next) => {
  const { value } = req.params

  try {
    const result = await SearchResult.find({
      content: { $regex: value, $options: 'i' },
    })
      .sort({ times: -1 })
      .limit(10)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export const addSearchResult = async (req, res, next) => {
  const { value } = req.params

  try {
    const result = await SearchResult.findOne({
      content: value,
    })
    if (result) {
      await SearchResult.findByIdAndUpdate(result._id, {
        $inc: { times: 1 },
      })
    } else {
      const newSearchResult = new SearchResult({ content: value })
      newSearchResult.save()
    }
    res.status(200).json({ message: 'Added' })
  } catch (err) {
    next(err)
  }
}
