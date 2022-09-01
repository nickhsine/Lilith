import { customFields, utils } from '@mirrormedia/lilith-core'
import {
  list,
  // graphql
} from '@keystone-6/core'
import {
  text,
  integer,
  relationship,
  select,
  json,
  timestamp,
  // virtual
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum Status {
  Published = 'published',
  Draft = 'draft',
  Scheduled = 'scheduled',
  Archived = 'archived',
}

const listConfigurations = list({
  fields: {
    title: text({
      label: '標題',
    }),
    subtitle: text({
      label: '副標',
    }),
    weight: integer({
      label: '權重',
      defaultValue: 85,
      validation: {
        min: 1,
        max: 9999,
      },
    }),
    status: select({
      label: '狀態',
      type: 'enum',
      options: [
        { label: '出版', value: Status.Published },
        { label: '草稿', value: Status.Draft },
        { label: '排程', value: Status.Scheduled },
        { label: '下架', value: Status.Archived },
      ],
      defaultValue: 'draft',
      ui: {
        displayMode: 'segmented-control',
        listView: {
          fieldMode: 'read',
        },
      },
    }),
    publishDate: timestamp({
      label: '發布日期',
      defaultVaule: { kind: 'now' },
    }),
    heroImage: customFields.relationship({
      label: '首圖',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
    }),
    heroCaption: text({
      label: '首圖圖說',
    }),
    heroCreditUrl: text({
      label: '首圖來源網址',
    }),
    content: customFields.richTextEditor({
      label: '內文',
    }),
    columns: relationship({
      label: '作者',
      ref: 'Column.specialfeatures',
      many: true,
    }),
    section: relationship({
      label: '大分類',
      ref: 'Section.specialfeatures',
      ui: {
        hideCreate: true,
      },
      many: false,
    }),
    category: relationship({
      label: '小分類',
      ref: 'Category.specialfeatures',
      ui: {
        hideCreate: true,
      },
      many: false,
    }),
    region: select({
      label: '地區',
      options: [
        { label: '台灣', value: 'tw' },
        { label: '國際', value: 'global' },
      ],
    }),
    relatedPosts: customFields.relationship({
      label: '相關文章',
      ref: 'Post',
      many: true,
      ui: {
        displayMode: 'select',
        hideCreate: true,
        labelField: 'name',
      },
    }),
    specialfeatureLists: relationship({
      label: 'Special Feature List',
      ref: 'SpecialfeatureList.specialfeatures',
      many: true,
      ui: {
        labelField: 'title',
      },
    }),
    tags: relationship({
      ref: 'Tag.specialfeatures',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    // previewButton: virtual({
    //   field: graphql.field({
    //     type: graphql.String,
    //     resolve(item: Record<string, unknown>): string {
    //       return `/story/${item?.id}`
    //     },
    //   }),
    //   ui: {
    //     views: require.resolve('./preview-button'),
    //   },
    // }),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },
  ui: {
    labelField: 'title',
    listView: {
      initialColumns: ['id', 'title', 'publishDate', 'status'],
      initialSort: { field: 'publishDate', direction: 'DESC' },
      pageSize: 50,
    },
  },

  access: {
    operation: {
      update: () => true,
      // update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin),
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData }) => {
      const { content } = resolvedData
      if (content) {
        resolvedData.apiData = customFields.draftConverter
          .convertToApiData(content)
          .toJS()
      }

      return resolvedData
    },
    validateInput: async ({
      operation,
      item,
      resolvedData,
      addValidationError,
    }) => {
      // publishDate is must while status is not `draft`
      if (operation == 'create') {
        const { status } = resolvedData
        if (status && status != 'draft') {
          const { publishDate } = resolvedData
          if (!publishDate) {
            addValidationError('需要填入發布時間')
          }
        }
      }
      if (operation == 'update') {
        if (resolvedData.status && resolvedData.status != 'draft') {
          const publishDate = resolvedData.publishDate || item.publishDate
          if (!publishDate) {
            addValidationError('需要填入發布時間')
          }
        } else if (resolvedData.publishDate === null) {
          const status = resolvedData.status || item.status
          if (status != 'draft') {
            addValidationError('需要填入發布時間')
          }
        }
      }
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
