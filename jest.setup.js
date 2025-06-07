// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock the Shopify app bridge
jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: jest.fn(() => ({
    dispatch: jest.fn(),
  })),
  Provider: ({ children }) => children,
}));

// Mock the Remix useSubmit hook
jest.mock("@remix-run/react", () => ({
  ...jest.requireActual("@remix-run/react"),
  useSubmit: jest.fn(() => jest.fn()),
  useLoaderData: jest.fn(() => ({})),
  useActionData: jest.fn(() => null),
  Form: ({ children, ...props }) => <form {...props}>{children}</form>,
}));

// Mock the Shopify Polaris components
jest.mock("@shopify/polaris", () => {
  const originalModule = jest.requireActual("@shopify/polaris");
  
  return {
    ...originalModule,
    // Add any specific mocks for Polaris components here
  };
});
