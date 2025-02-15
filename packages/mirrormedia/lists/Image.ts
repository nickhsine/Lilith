import config from '../config'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { file, image, text, virtual, checkbox } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  db: {
    map: 'Image',
  },
  fields: {
    name: text({
      label: 'name',
      validation: { isRequired: true },
    }),
    imageFile: image({
      storage: 'images',
    }),
    waterMark: checkbox({
      label: '浮水印',
	  defaultValue: true,
    }),
    resized: virtual({
      field: graphql.field({
        type: graphql.object<{
          original: string
          w480: string
          w800: string
          w1200: string
          w1600: string
          w2400: string
        }>()({
          name: 'ResizedImages',
          fields: {
            original: graphql.field({ type: graphql.String }),
            w480: graphql.field({ type: graphql.String }),
            w800: graphql.field({ type: graphql.String }),
            w1200: graphql.field({ type: graphql.String }),
            w1600: graphql.field({ type: graphql.String }),
            w2400: graphql.field({ type: graphql.String }),
          },
        }),
        resolve(item: Record<string, unknown>) {
          const empty = {
            original: '',
            w480: '',
            w800: '',
            w1200: '',
            w1600: '',
            w2400: '',
          }

          // For backward compatibility,
          // this image item is uploaded via `GCSFile` custom field.
          if (item?.urlOriginal) {
            return Object.assign(empty, {
              original: item.urlOriginal,
            })
          }

          const rtn: Record<string, string> = {}
          const filename = item?.imageFile_id

          if (!filename) {
            return empty
          }

          const extension = item?.imageFile_extension
            ? '.' + item.imageFile_extension
            : ''
          const width =
            typeof item?.imageFile_width === 'number' ? item.imageFile_width : 0
          const height =
            typeof item?.imageFile_height === 'number'
              ? item.imageFile_height
              : 0

          const resizedTargets =
            width >= height
              ? ['w480', 'w800', 'w1600', 'w2400']
              : ['w480', 'w800', 'w1200', 'w1600']

          resizedTargets.forEach((target) => {
            rtn[
              target
            ] = `${config.googleCloudStorage.origin}/${config.googleCloudStorage.bucket}/images/${filename}-${target}${extension}`
          })

          rtn[
            'original'
          ] = `${config.googleCloudStorage.origin}/${config.googleCloudStorage.bucket}/images/${filename}${extension}`
          return Object.assign(empty, rtn)
        },
      }),
      ui: {
        query: '{ original w480 w800 w1200 w1600 w2400 }',
      },
    }),
    file: file({
      label: '檔案（建議長邊大於 2000 pixel）',
      storage: 'files',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
        listView: {
          fieldMode: 'read',
        },
      },
    }),
    urlOriginal: text({
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
        listView: {
          fieldMode: 'read',
        },
      },
    }),
    copyRight: checkbox({
      label: '版權',
    }),
  },
  ui: {
    listView: {
      initialColumns: ['name', 'imageFile'],
      initialSort: { field: 'updatedAt', direction: 'ASC' },
      pageSize: 50,
    },
  },

  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin),
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
