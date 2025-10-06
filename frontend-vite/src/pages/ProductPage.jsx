import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import toast from 'react-hot-toast'

import api from '../lib/axios'

const ProductPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`)
        setProduct(response.data)
      } catch (error) {
        console.error("Error fetching product:", error)
        toast.error("Failed to load product!")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div>ProductPage</div>
  )
}

export default ProductPage