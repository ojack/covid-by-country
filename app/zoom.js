const d3 = require('d3')

module.exports = () => {

    const zx = d3.zoom()
    const zy = d3.zoom()

    // dummy elements to store zoom because current transform not stored in zoom but on element
    const _gx = d3.create("g")
    const _gy = d3.create("g")
    _gx.call(zx)
    _gy.call(zy)
    // get current transform
    const _tx = () => d3.zoomTransform(_gx.node())
    const _ty = () => d3.zoomTransform(_gy.node())

    let z = d3.zoomIdentity;

    const updateExtent = function(xTransforms, yTransforms) {
      zx.transform(_gx, xTransforms)
      zy.transform(_gy, yTransforms)
    }

    //
    const updateFromTouchEvent = (e) => {
    //  console.log(e.sourceEvent)
      const t = e.transform;
      const k = t.k / z.k;

      // let tx = state.layout.graph.transformX
      // let ty = state.layout.graph.transformY
      //  const point = e.sourceEvent ? d3.pointer(e) : [width / 2, height / 2];
      const shift = e.sourceEvent && e.sourceEvent.shiftKey;
      const point =  e.sourceEvent ? [e.sourceEvent.offsetX, e.sourceEvent.offsetY] : [ 0, state.layout.graph.height]
      if (k === 1) {
        // tx = tx.translate((t.x - z.x)/tx.k, 0)
        // ty = ty.translate(0, (t.y - z.y) / ty.k)

        // testing zoom
        _gx.call(zx.translateBy, (t.x - z.x)/_tx().k, 0)
        _gy.call(zy.translateBy, 0, (t.y - z.y) / _ty().k)
      } else {
        // tx = tx.scale(shift ? 1/k : k)
        // ty = ty.translate(0, - state.layout.graph.height*(k-1)).scale(k)

        // testing zoom
        _gx.call(zx.scaleBy, shift ? 1 / k : k, point)
        _gy.call(zy.scaleBy, k, point)
      }
      // state.layout.graph.transformX = tx
      // state.layout.graph.transformY = ty
      z = t
    }

    return {
      tx: _tx,
      ty: _ty,
      updateFromTouchEvent: updateFromTouchEvent,
      updateExtent: updateExtent
    }
}
