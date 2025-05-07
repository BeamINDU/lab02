import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { RotateCcw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, Crop } from 'lucide-react';
import { PhotoEditorProps } from './interface';
import { usePhotoEditor } from '@/app/hooks/usePhotoEditor';

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  file,
  onSaveImage,
  allowColorEditing = true,
  allowFlip = true,
  allowRotate = true,
  allowZoom = true,
  allowCrop = true,
  downloadOnSave,
  open,
  onClose,
  modalHeight,
  modalWidth,
  canvasHeight,
  canvasWidth,
  maxCanvasHeight,
  maxCanvasWidth,
  labels = {
    close: 'Close',
    save: 'Save',
    rotate: 'Rotate',
    brightness: 'Brightness',
    contrast: 'Contrast',
    saturate: 'Saturate',
    grayscale: 'Grayscale',
    reset: 'Reset photo',
    flipHorizontal: 'Flip photo horizontally',
    flipVertical: 'Flip photo vertically',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    crop: 'Crop',
  }
}) => {
  // const modalHeaderButtonClasses = 'text-gray-900 bg-white border border-gray-300 ml-2 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-full text-sm px-2 py-1 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700';

  const {
    canvasRef,
    brightness,
    setBrightness,
    contrast,
    setContrast,
    saturate,
    setSaturate,
    grayscale,
    setGrayscale,
    rotate,
    setRotate,
    flipHorizontal,
    setFlipHorizontal,
    flipVertical,
    setFlipVertical,
    isDragging,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
    handleWheel,
    handleZoomIn,
    handleZoomOut,
    handleCrop,
    resetFilters,
    downloadImage,
    generateEditedFile,
    applyFilter
  } = usePhotoEditor({ file });

  if (!file) return;

  /* eslint-disable react-hooks/rules-of-hooks */
  useEffect(() => {
    if (open) {
      resetFilters();
      applyFilter();
    }
  }, [open]);
  /* eslint-enable react-hooks/rules-of-hooks */

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    setValue: React.Dispatch<React.SetStateAction<number>>,
    min: number,
    max: number
  ) => {
    const value = parseInt(event.target?.value);
    if (!isNaN(value) && value >= min && value <= max) {
      setValue(value);
    }
  };

  const renderInputs = [
    {
      name: labels.rotate,
      value: rotate,
      setValue: setRotate,
      min: -180,
      max: 180,
      type: 'range',
      id: 'rotateInput',
      'aria-labelledby': 'rotateInputLabel',
      hide: !allowRotate,
    },
    {
      name: labels.brightness,
      value: brightness,
      setValue: setBrightness,
      min: 0,
      max: 200,
      type: 'range',
      id: 'brightnessInput',
      'aria-labelledby': 'brightnessInputLabel',
      hide: !allowColorEditing,
    },
    {
      name: labels.contrast,
      value: contrast,
      setValue: setContrast,
      min: 0,
      max: 200,
      type: 'range',
      id: 'contrastInput',
      'aria-labelledby': 'contrastInputLabel',
      hide: !allowColorEditing,
    },
    {
      name: labels.saturate,
      value: saturate,
      setValue: setSaturate,
      min: 0,
      max: 200,
      type: 'range',
      id: 'saturateInput',
      'aria-labelledby': 'saturateInputLabel',
      hide: !allowColorEditing,
    },
    {
      name: labels.grayscale,
      value: grayscale,
      setValue: setGrayscale,
      min: 0,
      max: 100,
      type: 'range',
      id: 'grayscaleInput',
      'aria-labelledby': 'grayscaleInputLabel',
      hide: !allowColorEditing,
    },
  ];

  const closeEditor = () => {
    resetFilters();
    if (onClose) {
      onClose();
    }
  };

  const saveImage = async () => {
    if (downloadOnSave) {
      downloadImage();
    }

    const editedFile = await generateEditedFile();

    if (editedFile) {
      onSaveImage(editedFile);
    }
  
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {open && (
        <>
          <div className='photo-editor-main justify-center items-center flex overflow-auto fixed inset-0 z-50'>
            <div
              style={{
                // height: modalHeight ?? '38rem',
                // width: modalWidth ?? '40rem'
                height: modalHeight ?? '40rem',
                width: modalWidth ?? '100rem'
              }}
              id='photo-editor-modal'
              className='relative rounded-lg shadow-lg max-sm:w-[22rem] bg-white'
              // className='relative rounded-lg shadow-lg max-sm:w-[22rem] bg-white dark:bg-[#1e1e1e]'
            >
              <div className='flex justify-end p-2 rounded-t'>
                <button
                  className="px-3 py-1 text-md rounded transition bg-gray-300 text-gray-500 ml-2"
                  // className={modalHeaderButtonClasses}
                  onClick={closeEditor}
                  type='button'
                >
                  {labels.close}
                </button>
                <button
                  className="px-3 py-1 text-md rounded transition text-white bg-[#0369A1] hover:bg-blue-600 ml-2"
                  // className={modalHeaderButtonClasses}
                  onClick={() => saveImage()}
                  type='button'
                >
                  {labels.save}
                </button>
                {/* <button onClick={closeEditor} className="text-xl text-gray-500 hover:text-gray-800">
                  ✕
                </button> */}
              </div>
              <div className='p-2'>
                <div className='flex flex-col'>
                  <canvas
                    style={{
                      width: canvasWidth ?? 'auto',
                      height: canvasHeight ?? 'auto',
                      maxHeight: maxCanvasHeight ?? '33rem',
                      maxWidth: maxCanvasWidth ?? '70rem'
                    }}
                    className={`canvas border-gray-700 object-fit mx-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    // className={`canvas border dark:border-gray-700 object-fit mx-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    id='canvas'
                    ref={canvasRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onWheel={handleWheel}
                    width={typeof canvasWidth === 'number' ? canvasWidth : undefined}
                    height={typeof canvasHeight === 'number' ? canvasHeight : undefined}
                  />

                  <div className='items-center flex m-1 flex-col'>
                    <div className='flex flex-col bottom-12 gap-1 mt-4 max-sm:w-72 w-11/12 absolute '>
                      {renderInputs.map(
                        (input) =>
                          !input.hide && (
                            <div key={input.name} className='flex flex-row items-center'>
                              <label
                                id={`${input.name}InputLabel`}
                                className='text-xs font-medium text-gray-900 w-10'
                                // className='text-xs font-medium text-gray-900 dark:text-white w-10'
                              >
                                {input.name[0].toUpperCase() + input.name.slice(1)}:{' '}
                              </label>
                              <input
                                id={input.id}
                                aria-labelledby={input['aria-labelledby']}
                                type={input.type}
                                value={input.value}
                                step='1'
                                onChange={(e) =>
                                  handleInputChange(e, input.setValue, input.min, input.max)
                                }
                                min={input.min}
                                max={input.max}
                                className='ml-[1.7rem] w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm'
                                // className='ml-[1.7rem] w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm dark:bg-gray-700'
                              />
                              <input
                                type='number'
                                aria-labelledby={input['aria-labelledby']}
                                value={input.value}
                                onChange={(e) =>
                                  handleInputChange(e, input.setValue, input.min, input.max)
                                }
                                min={input.min}
                                max={input.max}
                                className='w-14 ml-2 rounded-md text-right bg-gray-100 text-black'
                                // className='w-14 ml-2 rounded-md text-right bg-gray-100 text-black dark:bg-gray-700 dark:text-white'
                              />
                            </div>
                          )
                      )}
                    </div>
                  </div>

                  <div className='flex justify-center'>
                    <div className='mb-1 absolute bottom-0 mt-2'>
                      <button
                        title={labels.reset}
                        className='mx-1 focus:ring-2 focus:ring-gray-300 rounded-md p-1'
                        // className='mx-1 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 rounded-md p-1'
                        onClick={resetFilters}
                        aria-label={labels.reset}
                        type='button'
                      >
                        {/* <RotateCcw className="w-6 h-6 text-white dark:text-slate-200" /> */}
                        <RotateCcw className="w-6 h-6 text-slate-500" />
                      </button>

                      {allowCrop && (
                        <button
                          title={labels.crop}
                          className='mx-1 focus:ring-2 focus:ring-gray-300 rounded-md p-1'
                          onClick={handleCrop}
                          aria-label={labels.crop}
                          type='button'
                        >
                          <Crop className="w-6 h-6 text-slate-500" />
                        </button>
                      )}
                      
                      {allowFlip && (
                        <div className='inline-block'>
                          <button
                            className='mx-1 focus:ring-2 focus:ring-gray-300 rounded-md p-1'
                            onClick={() => setFlipHorizontal(!flipHorizontal)}
                            type='button'
                            title={labels.flipHorizontal}
                            aria-label={labels.flipHorizontal}
                          >
                            <FlipHorizontal className="w-6 h-6 text-slate-500" />
                          </button>
                          <button
                            className='mx-1 focus:ring-2 focus:ring-gray-300 rounded-md p-1'
                            onClick={() => setFlipVertical(!flipVertical)}
                            type='button'
                            title={labels.flipVertical}
                            aria-label={labels.flipVertical}
                          >
                            <FlipVertical className="w-6 h-6 text-slate-500" />
                          </button>
                        </div>
                      )}

                      {allowZoom && (
                        <div className='inline-block'>
                          <button
                            type='button'
                            className='mx-1 focus:ring-2 focus:ring-gray-300 rounded-md p-1'
                            onClick={handleZoomIn}
                            title={labels.zoomIn}
                            aria-label={labels.zoomIn}
                          >
                            <ZoomIn className="w-6 h-6 text-slate-500" />
                          </button>
                          <button
                            type='button'
                            className='mx-1 focus:ring-2 focus:ring-gray-300 rounded-md p-1'
                            onClick={handleZoomOut}
                            title={labels.zoomOut}
                            aria-label={labels.zoomOut}
                          >
                            <ZoomOut className="w-6 h-6 text-slate-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
              
              {/* <div className='flex justify-center'>
                <div className='mb-3 absolute bottom-0 mt-1'>
                  <button
                    className="px-3 py-1 text-md rounded transition bg-gray-300 text-gray-500 ml-2"
                    // className={modalHeaderButtonClasses}
                    onClick={closeEditor}
                    type='button'
                  >
                    {labels.close}
                  </button>
                  <button
                    className="px-3 py-1 text-md rounded transition text-white bg-[#0369A1] hover:bg-blue-600 ml-2"
                    // className={modalHeaderButtonClasses}
                    onClick={() => saveImage()}
                    type='button'
                  >
                    {labels.save}
                  </button>
                </div>
              </div> */}

            </div>
            
          </div>
          <div className='opacity-75 fixed inset-0 z-40 bg-black'></div>
        </>
      )}
    </>
  );
};
