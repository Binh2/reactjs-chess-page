// // To shut up TypeScript errors about ReactDOM.render having no types
// declare module 'react-dom' {
//     export default ReactDOM;
//     namespace ReactDOM {
//         function render(
//             element: React.ReactElement,
//             container: Element | DocumentFragment | null,
//             callback?: () => void
//         ): React.Component | void;
//     }
// }