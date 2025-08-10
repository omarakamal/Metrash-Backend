const router = require("express").Router()
const Product = require('../models/Product')
const mongoose = require("mongoose")
const verifyToken = require("../middleware/verifyToken")

router.get("/",async(req,res)=>{
 try {
    // Destructure and sanitize query params
    const {
      name = '',
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Search by name (partial, case-insensitive)
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    // Price filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Pagination
    const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
    const pageSize = parseInt(limit) > 0 ? parseInt(limit) : 10;
    const skip = (pageNumber - 1) * pageSize;

    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(pageSize),
      Product.countDocuments(query),
    ]);

    res.json({
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
      totalItems: total,
      products,
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get("/:productId",async(req,res)=>{
 try {
    if(!mongoose.Types.ObjectId.isValid(req.params.productId)){
      return res.status(400).json({ error: 'Invalid product ID format' })
    }
    const foundProduct = await Product.findById(req.params.productId)

    res.status(200).json(foundProduct)

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.use(verifyToken)

router.post("/",async (req,res)=>{
    try{
      console.log(req.body)
        const {name, price, description, imageUrl} = req.body
        const newProduct = {name, price, description, imageUrl}
        const createdProduct=  await Product.create(newProduct)
        res.json(createdProduct)
    }
    catch(error){
      console.log("Error",error)
    res.status(500).json({ error: 'Server error' });
    }
})



// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/bulk', async (req, res) => {
  try {
    const products = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array of products' });
    }

    // Step 1: Validate each product
    const invalidProducts = [];
    const validProducts = [];

    for (const product of products) {
      try {
        const newProduct = new Product(product);
        await newProduct.validate(); // manual validation
        validProducts.push(product);
      } catch (validationError) {
        invalidProducts.push({
          product,
          error: validationError.message
        });
      }
    }

    // Step 2: Filter out duplicates (by name)
    const existingNames = await Product.find({ name: { $in: validProducts.map(p => p.name) } }).select('name');
    const existingNameSet = new Set(existingNames.map(p => p.name));

    const uniqueProducts = validProducts.filter(p => !existingNameSet.has(p.name));
    const skippedDuplicates = validProducts.filter(p => existingNameSet.has(p.name));

    // Step 3: Insert unique products
    let insertedProducts = [];
    if (uniqueProducts.length > 0) {
      insertedProducts = await Product.insertMany(uniqueProducts, { ordered: false });
    }

    // Step 4: Return response
    res.status(201).json({
      insertedCount: insertedProducts.length,
      skippedDuplicateCount: skippedDuplicates.length,
      invalidCount: invalidProducts.length,
      insertedProducts,
      skippedDuplicates,
      invalidProducts
    });

  } catch (error) {
    console.error('Bulk insert failed:', error);
    res.status(500).json({ error: 'Internal server error during bulk insert' });
  }
});


module.exports = router