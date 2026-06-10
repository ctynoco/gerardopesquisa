import { useState, useEffect, useRef } from 'react'
import { Box, Typography, Avatar, IconButton, Slider } from '@mui/material'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import DeleteIcon from '@mui/icons-material/Delete'

const STORAGE_KEY = 'pesquisa_logo'

function resizeImage(file, maxDim) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = height * (maxDim / width); width = maxDim }
        else { width = width * (maxDim / height); height = maxDim }
      }
      canvas.width = width; canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/png'))
    }
    img.src = URL.createObjectURL(file)
  })
}

export default function LogoUpload({ size = 80 }) {
  const [logo, setLogo] = useState(localStorage.getItem(STORAGE_KEY) || '')
  const [sizes] = useState([80, 120, 150])
  const inputRef = useRef()

  useEffect(() => {
    if (logo) localStorage.setItem(STORAGE_KEY, logo)
    else localStorage.removeItem(STORAGE_KEY)
  }, [logo])

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.src = URL.createObjectURL(file)
    await new Promise((resolve) => { img.onload = resolve })
    if (img.width < 80 || img.height < 80) return alert('A imagem deve ter no mínimo 80×80 pixels')
    if (img.width > 150 || img.height > 150) return alert('A imagem deve ter no máximo 150×150 pixels')
    const resized = await resizeImage(file, 150)
    setLogo(resized)
  }

  function limpar() {
    setLogo('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <Box>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {logo ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={logo} sx={{ width: size, height: size, borderRadius: 1, border: '1px solid', borderColor: 'divider' }} />
            <IconButton size="small" color="error" onClick={limpar}><DeleteIcon fontSize="small" /></IconButton>
          </Box>
        ) : (
          <Box
            onClick={() => inputRef.current?.click()}
            sx={{
              width: size, height: size, border: '2px dashed', borderColor: 'divider', borderRadius: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
            }}
          >
            <AddPhotoAlternateIcon sx={{ color: 'text.disabled', fontSize: 24 }} />
          </Box>
        )}
        <Box>
          <Typography variant="caption" fontWeight={500}>Logomarca</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>80×80 a 150×150px</Typography>
          {!logo && (
            <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => inputRef.current?.click()}>
              Clique para adicionar
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export function getLogo() {
  return localStorage.getItem(STORAGE_KEY) || ''
}
