import { showNotification } from '/js/notification.js';

const baseFieldMapping = {
  botSelect: { id: 'botSelect', required: true },
  jsonInput: { id: 'jsonInput', required: true },
  messageContent: { id: 'message', jsonPath: 'content', default: '' },

  embedTitle: { id: 'embedTitle', jsonPath: 'embeds[0].title', default: '' },
  embedDescription: { id: 'embedDescription', jsonPath: 'embeds[0].description', default: '' },
  embedFooter: { id: 'embedFooter', jsonPath: 'embeds[0].footer.text', default: '' },
  imageLink: { id: 'imageLink', jsonPath: 'embeds[0].image.url', default: '' },

  embedColor: { 
    id: 'embedColor', 
    jsonPath: 'embeds[0].color', 
    default: '#ffffff',
    transform: (value) => {
      if (typeof value !== 'number' || !value) return '#ffffff';
      const hex = (value >>> 0).toString(16).padStart(6, '0');
      return `#${hex}`;
    }
  },

  showAvatar: { 
    id: 'showAvatar', 
    jsonPath: 'embeds[0].thumbnail.url', 
    default: false, 
    type: 'checkbox' 
  }
};

function getFieldMapping(moduleType) {
  const prefix = moduleType === 'goodbye' ? 'goodbye' : '';
  const fieldMapping = {};

  for (const key in baseFieldMapping) {
    const field = { ...baseFieldMapping[key] };
    if (key !== 'botSelect' && key !== 'jsonInput') {
      field.id = prefix + (prefix ? field.id.charAt(0).toUpperCase() + field.id.slice(1) : field.id);
    }
    fieldMapping[key] = field;
  }
  return fieldMapping;
}

function importJsonFromForm({ fieldMapping, importJsonFn, onSuccess, onError, moduleType }) {
  console.group('=== Import JSON Debug Start ===');
  const formData = {};
  for (const key in fieldMapping) {
    const { id, required, type } = fieldMapping[key];

    const element = document.getElementById(id);
    if (!element) {
      console.error(`[ERROR] Element with ID "${id}" NOT found for field "${key}"`);
      showNotification('error', `Element with ID ${id} not found.`);
      console.groupEnd();
      return;
    }
    formData[key] = type === 'checkbox' ? element.checked : element.value;

    if (required && !formData[key]) {
      console.warn(`[WARN] Required field "${key}" with ID "${id}" is empty or not filled.`);
      showNotification('error', 'Please fill in all required fields.');
      console.groupEnd();
      return;
    }
  }

  try {
    const json = JSON.parse(formData.jsonInput);
    const convertedJson = importJsonFn(formData.botSelect, json);

    for (const key in fieldMapping) {
      const { id, jsonPath, default: defaultValue, transform, type } = fieldMapping[key];
      if (!jsonPath) continue;

      const element = document.getElementById(id);
      if (!element) {
        console.warn(`[WARN] Element with ID "${id}" not found when filling field "${key}". Skipping.`);
        continue;
      }

      let value = defaultValue;

      try {
        value = jsonPath.split('.').reduce((obj, prop) => {
          if (prop.endsWith(']')) {
            const [arrayProp, index] = prop.slice(0, -1).split('[');
            obj = obj?.[arrayProp];
            return Array.isArray(obj) ? obj[Number(index)] : undefined;
          } 
          return obj?.[prop];
        }, convertedJson);

        if (value === undefined || value === null) value = defaultValue;
      } catch (err) {
        console.warn(`[WARN] Error trying to access jsonPath "${jsonPath}" for field "${key}":`, err);
        value = defaultValue;
      }

      if (transform) value = transform(value);

      if (type === 'checkbox') {
        element.checked = !!value;
      } else {
        element.value = value;
        element.dispatchEvent(new Event('change'));
        element.dispatchEvent(new Event('input'));
      }
    }

    showNotification('success', 'JSON imported successfully!');
    onSuccess?.(moduleType);
    window.showActionsWrapper?.();
    hide();

  } catch (error) {
    showNotification('error', 'Error importing JSON: ' + error.message);
    onError?.(error);
  }
  console.groupEnd();
}

function hide() {
  const popup = document.getElementById('popup');
  if (popup) {
    popup.classList.remove('visible');
    setTimeout(() => {
      popup.classList.add('hidden');
    }, 300);
  }
}

function showPopup() {
  const popup = document.getElementById('popup');
  if (popup) {
    popup.classList.remove('hidden');
    setTimeout(() => {
      popup.classList.add('visible');
    }, 10);
  }
}
window.showPopup = showPopup;

function importJson(bot, json) {
  switch (bot) {
    case 'loritta':
      return importFromLoritta(json);
    case 'carl-bot':
      return importFromCarl(json);
    default:
      showNotification('error', 'Unsupported bot.');
      return {};
  }
}

const placeholderMap = {
  '{@user}': '{@user}',
  '{user}': '{user}',
  '{user.name}': '{user}',
  '{user.id}': '{user.id}',
  '{guild}': '{guild.name}',
  '{guild.name}': '{guild.name}',
  '{guild.id}': '{guild.id}',
  '{user.avatar}': '{user.avatar}',
  '{guild.icon}': '{guild.icon}',
  '{mention}': '{@user}',
  '{server}': '{guild.name}',
  '{user(id)}': '{user.id}',
  '{user.tag}': '{user.tag}'
};

const incompatiblePlaceholder = 'incompatible placeholder';

function replacePlaceholders(obj) {
  if (typeof obj === 'string') {
    return obj.replace(/{[^}]+}/g, (match) => placeholderMap[match] || incompatiblePlaceholder);
  } else if (Array.isArray(obj)) {
    return obj.map(replacePlaceholders);
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, replacePlaceholders(value)])
    );
  }
  return obj;
}

function importFromLoritta(json) {
  const convertedJson = replacePlaceholders(json);

  if (convertedJson.embed) {
    convertedJson.embeds = [convertedJson.embed];
    delete convertedJson.embed;
  }

  if (convertedJson.content) {
    convertedJson.content = replacePlaceholders(convertedJson.content);
  }

  return convertedJson;
}

function importFromCarl(json) {
  const convertedJson = {
    content: json.content || '',
    embeds: [{
      title: null,
      description: null,
      color: null,
      image: { url: null },
      thumbnail: { url: null },
      footer: { text: null }
    }]
  };

  if (json.title) convertedJson.embeds[0].title = replacePlaceholders(json.title);
  if (json.description) convertedJson.embeds[0].description = replacePlaceholders(json.description);
  if (json.color) convertedJson.embeds[0].color = json.color;
  if (json.image) convertedJson.embeds[0].image.url = json.image.url || null;
  if (json.thumbnail) convertedJson.embeds[0].thumbnail.url = json.thumbnail.url || null;
  if (json.footer) convertedJson.embeds[0].footer.text = replacePlaceholders(json.footer.text);

  return convertedJson;
}

document.addEventListener('DOMContentLoaded', () => {
  let currentModuleType = 'welcome';

  const importButton = document.getElementById('import');
  if (importButton) {
    importButton.addEventListener('click', () => {
      const fieldMapping = getFieldMapping(currentModuleType);
      importJsonFromForm({
        fieldMapping,
        importJsonFn: importJson,
        onSuccess: (moduleType) => console.log('Import completed for:', moduleType),
        onError: (error) => console.error('Import failed:', error),
        moduleType: currentModuleType
      });
    });
  }

  const cancelButton = document.getElementById('cancel');
  if (cancelButton) cancelButton.addEventListener('click', hide);

  document.querySelectorAll('button[data-module-type]').forEach(button => {
    button.addEventListener('click', () => {
      currentModuleType = button.getAttribute('data-module-type') || 'welcome';
      showPopup();
    });
  });
});

window.importJsonFromForm = importJsonFromForm;
window.importJson = importJson;