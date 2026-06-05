// Utility function to dynamically load external scripts
// Returns a Promise that resolves with true if script loads successfully, false if it fails
const loadScript = (src) => {
    return new Promise((resolve) => {
        // Create a new script element
        const script = document.createElement('script')
        script.src = src
        // Handle successful script load
        script.onload = () => {
            resolve(true)
        }
        // Handle script load error
        script.onerror = () => {
            resolve(false)
        }
        // Append script to document body to trigger loading
        document.body.appendChild(script)
    })
}
export default loadScript;