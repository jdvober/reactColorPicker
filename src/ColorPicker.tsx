import React from 'react'

import { defaultStyles, Styles, darkStyles, MARKER_SIZE } from './styles'
import { rgbToHex, saveToClipboard } from './utils'

export type RGBColor = readonly [ number, number, number ]

export type ColorPicked = Readonly<{ rgb: RGBColor; hex: string }>

type MouseEventCanvas = React.MouseEvent<HTMLCanvasElement>

export type ColorPickerPaletteProps = Readonly<{
	styles?: Styles
	dark?: boolean
}>

const NO_COLOR = 'transparent'
const MARKER_OFFSET = MARKER_SIZE / 2

const ColorPicker: React.FC<ColorPickerPaletteProps> = ( {
	dark = false,
	styles = dark ? darkStyles : defaultStyles,
}: ColorPickerPaletteProps ) => {
	const [ color, setColor ] = React.useState<string>( NO_COLOR )
	const [ colorRGB, setColorRGB ] = React.useState<RGBColor | null>()
	const [ prevColor, setPrevColor ] = React.useState<string>( NO_COLOR )

	const [ markerX, setMarkerX ] = React.useState<number | null>( null )
	const [ markerY, setMarkerY ] = React.useState<number | null>( null )

	const canvasRef = React.createRef<HTMLCanvasElement>()

	const ctxRef = React.useRef<CanvasRenderingContext2D | null>()

	const canvasRectRef = React.useRef<DOMRect | null>()

	React.useEffect( () => {
		if ( canvasRef.current ) {
			let canvas = canvasRef.current

			let ctx = canvas.getContext( '2d' )
			ctxRef.current = ctx

			canvasRectRef.current = canvas.getBoundingClientRect()

			if ( ctx && canvasRectRef.current ) {
				let gradient = ctx.createLinearGradient( 0, 0, canvas.width, 0 )
				gradient.addColorStop( 0, 'rgb(255, 0, 0)' )
				gradient.addColorStop( 0.15, 'rgb(255, 0, 255)' )
				gradient.addColorStop( 0.33, 'rgb(0, 0, 255)' )
				gradient.addColorStop( 0.49, 'rgb(0, 255, 255)' )
				gradient.addColorStop( 0.67, 'rgb(0, 255, 0)' )
				gradient.addColorStop( 0.84, 'rgb(255, 255, 0)' )
				gradient.addColorStop( 1, 'rgb(255, 0, 0)' )
				ctx.fillStyle = gradient
				ctx.fillRect( 0, 0, ctx.canvas.width, canvas.height )
				gradient = ctx.createLinearGradient( 0, 0, 0, canvas!.height )
				gradient.addColorStop( 0, 'rgba(255, 255, 255, 1)' )
				gradient.addColorStop( 0.03, 'rgba(255, 255, 255, 1)' )
				gradient.addColorStop( 0.5, 'rgba(255, 255, 255, 0)' )
				gradient.addColorStop( 0.5, 'rgba(0, 0, 0, 0)' )
				gradient.addColorStop( 1, 'rgba(0, 0, 0, 1)' )
				ctx.fillStyle = gradient
				ctx.fillRect( 0, 0, ctx.canvas.width, ctx.canvas.height )
			}
		}
	} )

	const selectColor = ( event: MouseEventCanvas ): void => {
		if ( canvasRef.current && ctxRef.current && canvasRectRef.current ) {
			const colorX = event.clientX - canvasRectRef.current.left
			const colorY = event.clientY - canvasRectRef.current.top
			const imageData = ctxRef.current.getImageData( colorX, colorY, 1, 1 )
			const r = imageData.data[ 0 ]
			const g = imageData.data[ 1 ]
			const b = imageData.data[ 2 ]
			const newRGB: RGBColor = [ r, g, b ]
			const newHex = rgbToHex( newRGB )
			setColorRGB( newRGB )
			setPrevColor( color )
			setColor( newHex )
			saveToClipboard( newHex )
		} else {
			console.log( 'hmmm' )
			console.log( ctxRef.current, canvasRectRef.current )
		}
	}

	const setMarkerPos = ( e: MouseEventCanvas ) => {
		if ( canvasRef.current && ctxRef.current && canvasRectRef.current ) {
			setMarkerX( e.pageX - canvasRectRef.current.left / 2 )
			// setMarkerY( e.pageY - canvasRect.top / 2 )
			setMarkerY( e.pageY )
		}
	}

	const onClickCaptureWindow = ( e: any ) => {
		console.log( `pageX: ${ e.pageX }, pageY: ${ e.pageY }` )
	}

	window.onclick = onClickCaptureWindow

	return (
		<div style={ { ...styles.colorPicker } }>
			<canvas
				data-cy="canvas"
				style={ { ...styles.canvas } }
				width={ styles.canvas.width }
				height={ styles.canvas.height }
				ref={ canvasRef }
				onClick={ ( e ) => {
					selectColor( e )
					setMarkerPos( e )
				} }
			></canvas>
			{markerX && markerY && (
				<div
					data-cy="marker"
					style={ {
						...styles.marker,
						// top: markerY + MARKER_OFFSET,
						top: markerY - MARKER_OFFSET,
						left: markerX + ( MARKER_OFFSET / 2 ),
					} }
				/>
			) }
			<div style={ { ...styles.results } }>
				<div style={ { ...styles.result } }>
					<div data-cy="result-hex">{ color === NO_COLOR ? '' : color }</div>
				</div>
				<div style={ { ...styles.result } }>
					<div data-cy="result-rgb">
						{ colorRGB && `rgb(${ colorRGB[ 0 ] }, ${ colorRGB[ 1 ] }, ${ colorRGB[ 2 ] })` }
					</div>
				</div>
				<div style={ { ...styles.colors } }>
					<div
						data-cy="picked-color"
						onClick={ () => saveToClipboard( color ) }
						style={ { ...styles.color, backgroundColor: color } }
					/>
					<div
						data-cy="picked-prevColor"
						onClick={ () => saveToClipboard( prevColor ) }
						style={ { ...styles.prevColor, backgroundColor: prevColor } }
					/>
				</div>
			</div>
		</div>
	)
}

export default ColorPicker

