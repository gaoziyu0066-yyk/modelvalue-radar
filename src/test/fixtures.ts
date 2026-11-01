import type { Model } from '../types/model'
// Synthetic fixtures exclusively for tests. Never imported by production code.
export const testModel: Model = {
  id: 'test/alpha',
  name: 'TEST ONLY Alpha',
  provider: 'test',
  context: 128000,
  maxOutput: 16000,
  created: 1700000000,
  inputModalities: ['text', 'image'],
  outputModalities: ['text'],
  parameters: ['tools', 'response_format'],
  pricing: { input: 0.000002, output: 0.000008, cacheRead: 0.0000005, request: 0 },
  extraPricing: [],
  sourceUrl: 'https://example.invalid/test',
}
export const rawTestModel = {
  id: 'test/alpha',
  name: 'TEST ONLY Alpha',
  context_length: 128000,
  created: 1700000000,
  architecture: { input_modalities: ['text', 'image'], output_modalities: ['text'] },
  pricing: {
    prompt: '0.000002',
    completion: '0.000008',
    input_cache_read: '0.0000005',
    request: '0',
  },
  supported_parameters: ['tools', 'response_format'],
  top_provider: { max_completion_tokens: 16000 },
}
