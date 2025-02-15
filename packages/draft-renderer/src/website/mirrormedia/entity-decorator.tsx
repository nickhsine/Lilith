import { CompositeDecorator } from 'draft-js'
import {} from './entity-decorator'
import { entityDecorators } from './entity-decorators'

const { annotationDecorator, linkDecorator } = entityDecorators

const decorators = (contentLayout = 'normal') => {
  return new CompositeDecorator([
    annotationDecorator(contentLayout),
    linkDecorator(contentLayout),
  ])
}

export default decorators
