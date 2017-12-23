function checkArgs (r, ti, ta, ea, ts) {
  if (typeof r !== 'number') {
    throw new Error("Invalid parameter 'r' of type '" + (typeof r) + "', expected a number instead")
  }

  if (r < 1) {
    throw new Error("Invalid parameter 'r' of value '" + r + "', expected a number >= 1")
  }

  if (typeof ti !== 'number') {
    throw new Error("Invalid parameter 'ti' of type '" + (typeof ti) + "', expected a number instead")
  }

  if (ti < 1 || ti > r) {
    throw new Error("Invalid parameter 'ti' of value '" + ti + "', expected 1 <= ti <= r")
  }

  if (typeof ta !== 'boolean') {
    throw new Error("Invalid parameter 'ta' of type '" + (typeof ta) + "', expected a boolean value instead")
  }

  if (typeof ea !== 'boolean') {
    throw new Error("Invalid parameter 'ea' of type '" + (typeof ea) + "', expected a boolean value instead")
  }

  if (typeof ts !== 'boolean') {
    throw new Error("Invalid parameter 'ts' of type '" + (typeof ts) + "', expected a boolean value instead")
  }
}

module.exports = function (r, ti, ta, ea, ts) {
  checkArgs(r, ti, ta, ea, ts)
  var n = 1
  var terminated = false
  var abort = ta ? true : new Error("ReferenceSink: Generated Error (ta === false)")

  return function sink (request) {
    function ask (i, terminate) {
      function doRequest () {
          if (ts || i < ti - 1) {
            request(false, x)
          } else if (i === ti - 1) {
            request(false, function () { })
            setImmediate(function () {terminate(abort, ++i)})
          } else if (i >= ti) {
            terminate(abort, i)
          }
      }
      function x (done, v) {
        ++i
        doRequest()
      }

      doRequest()
    }

    function terminate(abort, i) {
      if (ea) {
        terminateX(abort,i)
      } else {
        terminateNoX(abort,i)
      }
    }

    function terminateX (abort, i) {
      function x (done) {
        setImmediate(function () { terminateX(abort, i+1) })
      }

      if (i > r) return

      if (i < ti) {
        request(abort, x)  
      } else if (i >= ti) {
        if (ts) {
          request(abort, x)  
        } else {
          while (i++ <= r) {
            setImmediate(function () { request(abort, function () {}) })
          }
        }
      }
    }

    function terminateNoX (abort, i) {
      if (i > r) return

      while (i++ <= r) {
        setImmediate(function () { request(abort) })
      }
    }
  }
}